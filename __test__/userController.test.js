import { jest } from "@jest/globals";
import userController from "../src/controllers/userController.js";

describe("userController - Testes Unitários", () => {
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe("createUser - validação inicial", () => {
    it("CT01 - retorna status 400 quando faltam campos obrigatórios", async () => {
      const req = {
        body: {
          email: "usuario@teste.com",
        },
      };
      const res = mockResponse();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Todos os campos devem ser preenchidos",
      });
    });

    it("CT02 - retorna status 400 quando CPF não possui 11 dígitos", async () => {
      const req = {
        body: {
          cpf: "123",
          email: "usuario@teste.com",
          password: "password123",
          name: "Teste",
          data_nascimento: "2000-01-01",
        },
      };
      const res = mockResponse();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
      });
    });

    it("CT03 - retorna status 400 quando e-mail não contém @", async () => {
      const req = {
        body: {
          cpf: "12345678901",
          email: "usuario_sem_arroba",
          password: "password123",
          name: "Teste",
          data_nascimento: "2000-01-01",
        },
      };
      const res = mockResponse();

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email inválido. Deve conter @",
      });
    });
  });
});
