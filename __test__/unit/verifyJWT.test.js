import { jest } from "@jest/globals";

// Mock do jsonwebtoken ANTES de importar o middleware
const mockVerify = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { verify: mockVerify },
}));

const { default: verifyJWT } = await import("../../src/services/verifyJWT.js");

describe("verifyJWT - Testes Unitários do Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    mockVerify.mockClear();
  });

  it("CT01 - retorna 401 quando nenhum token é fornecido", () => {
    // Arrange — sem header authorization

    // Act
    verifyJWT(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      auth: false,
      message: "Token não foi fornecido",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("CT02 - retorna 403 quando o token é inválido", () => {
    // Arrange
    req.headers["authorization"] = "token_invalido";
    mockVerify.mockImplementation((_token, _secret, cb) =>
      cb(new Error("invalid token"), null)
    );

    // Act
    verifyJWT(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      auth: false,
      message: "Falha na autenticação do Token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("CT03 - chama next() e seta req.userId quando token é válido", () => {
    // Arrange
    req.headers["authorization"] = "token_valido";
    mockVerify.mockImplementation((_token, _secret, cb) =>
      cb(null, { id: 42 })
    );

    // Act
    verifyJWT(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(42);
    expect(res.status).not.toHaveBeenCalled();
  });
});
