import { jest } from "@jest/globals";

// Mock do módulo de conexão com o banco ANTES de importar o service
const mockQuery = jest.fn();

jest.unstable_mockModule("../../src/db/connect.js", () => ({
  default: { query: mockQuery },
}));

const { default: validateCpf } = await import("../../src/services/validateCpf.js");

describe("validateCpf - Testes Unitários", () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  it("CT01 - retorna null quando CPF não existe no banco", async () => {
    // Arrange
    mockQuery.mockImplementation((_sql, _vals, cb) => cb(null, []));

    // Act
    const result = await validateCpf("12345678901");

    // Assert
    expect(result).toBeNull();
  });

  it("CT02 - retorna erro quando CPF já está cadastrado (criação)", async () => {
    // Arrange
    mockQuery.mockImplementation((_sql, _vals, cb) =>
      cb(null, [{ id_usuario: 1 }])
    );

    // Act
    const result = await validateCpf("12345678901");

    // Assert
    expect(result).toEqual({ error: "CPF já cadastrado" });
  });

  it("CT03 - retorna null quando CPF pertence ao próprio usuário (atualização)", async () => {
    // Arrange
    mockQuery.mockImplementation((_sql, _vals, cb) =>
      cb(null, [{ id_usuario: 5 }])
    );

    // Act
    const result = await validateCpf("12345678901", 5);

    // Assert
    expect(result).toBeNull();
  });

  it("CT04 - retorna erro quando CPF pertence a outro usuário (atualização)", async () => {
    // Arrange
    mockQuery.mockImplementation((_sql, _vals, cb) =>
      cb(null, [{ id_usuario: 99 }])
    );

    // Act
    const result = await validateCpf("12345678901", 5);

    // Assert
    expect(result).toEqual({ error: "CPF já cadastrado para outro usuário" });
  });

  it("CT05 - rejeita a promise em caso de erro no banco", async () => {
    // Arrange
    mockQuery.mockImplementation((_sql, _vals, cb) =>
      cb(new Error("DB error"), null)
    );

    // Act & Assert
    await expect(validateCpf("12345678901")).rejects.toMatch("Erro ao verificar CPF");
  });
});
