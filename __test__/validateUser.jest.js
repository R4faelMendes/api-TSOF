import validateUser from "../src/services/validateUser.js";

describe("validateUser - Testes Unitários", () => {
  const usuarioValido = {
    cpf: "12345678901",
    email: "aluno@senai.br",
    password: "123",
    name: "Aluno",
    data_nascimento: "2005-05-10",
  };

  it("CT01 - retorna null quando todos os dados são válidos", () => {
    expect(validateUser(usuarioValido)).toBeNull();
  });

  it("CT02 - retorna erro quando falta data_nascimento", () => {
    const { data_nascimento, ...semData } = usuarioValido;
    expect(validateUser(semData)).toEqual({
      error: "Todos os campos devem ser preenchidos",
    });
  });

  it("CT03 - retorna erro quando falta email", () => {
    const { email, ...semEmail } = usuarioValido;
    expect(validateUser(semEmail)).toEqual({
      error: "Todos os campos devem ser preenchidos",
    });
  });

  it("CT04 - retorna erro quando o email não tem @", () => {
    expect(validateUser({ ...usuarioValido, email: "alunosenai.br" })).toEqual({
      error: "Email inválido. Deve conter @",
    });
  });

  it("CT05 - retorna erro quando cpf não tem 11 dígitos", () => {
    expect(validateUser({ ...usuarioValido, cpf: "123" })).toEqual({
      error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
    });
  });
});