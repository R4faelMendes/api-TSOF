import validateUser from "../../src/services/validateUser.js";

describe("validateUser - Testes Unitários", () => {
  const usuarioValido = {
    cpf: "12345678901",
    email: "aluno@senai.br",
    password: "123",
    name: "Aluno",
    data_nascimento: "2005-05-10",
  };

  // Happy Path
  it("CT01 - retorna null quando todos os dados são válidos", () => {
    expect(validateUser(usuarioValido)).toBeNull();
  });

  // Campos obrigatórios
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

  it("CT04 - retorna erro quando falta password", () => {
    const { password, ...semPassword } = usuarioValido;
    expect(validateUser(semPassword)).toEqual({
      error: "Todos os campos devem ser preenchidos",
    });
  });

  it("CT05 - retorna erro quando falta name", () => {
    const { name, ...semName } = usuarioValido;
    expect(validateUser(semName)).toEqual({
      error: "Todos os campos devem ser preenchidos",
    });
  });

  it("CT06 - retorna erro quando falta cpf", () => {
    const { cpf, ...semCpf } = usuarioValido;
    expect(validateUser(semCpf)).toEqual({
      error: "Todos os campos devem ser preenchidos",
    });
  });

  // Validação de CPF
  it("CT07 - retorna erro quando CPF contém letras", () => {
    expect(validateUser({ ...usuarioValido, cpf: "1234567890a" })).toEqual({
      error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
    });
  });

  it("CT08 - retorna erro quando CPF tem menos de 11 dígitos", () => {
    expect(validateUser({ ...usuarioValido, cpf: "123456789" })).toEqual({
      error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
    });
  });

  it("CT09 - retorna erro quando CPF tem mais de 11 dígitos", () => {
    expect(validateUser({ ...usuarioValido, cpf: "123456789012" })).toEqual({
      error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
    });
  });

  // Validação de Email
  it("CT10 - retorna erro quando email não tem @", () => {
    expect(validateUser({ ...usuarioValido, email: "alunosenai.br" })).toEqual({
      error: "Email inválido. Deve conter @",
    });
  });
});
