import request from 'supertest';
import app from '../../src/index.js';

const target = process.env.TEST_BASE_URL || app;
const cpfUnico = String(Date.now()).slice(0, 11).padEnd(11, '0');
const emailUnico = 'test_' + Date.now() + '@senai.br';
let tokenValido = '';
let userIdCriado = null;

describe('Integracao - /api/v1/user', () => {

  describe('POST /api/v1/user', () => {
    it('CT01 - cria usuario com dados validos => 201', async () => {
      const res = await request(target).post('/api/v1/user')
        .send({ cpf: cpfUnico, email: emailUnico, password: 'senha123', name: 'Aluno Teste', data_nascimento: '2000-01-01' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Usuário criado com sucesso');
    });

    it('CT02 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).post('/api/v1/user').send({ email: emailUnico });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('CT03 - retorna 400 quando email nao tem @', async () => {
      const res = await request(target).post('/api/v1/user')
        .send({ cpf: '98765432100', email: 'emailsemarrobasenai.br', password: 'abc', name: 'Teste', data_nascimento: '2000-01-01' });
      expect(res.status).toBe(400);
    });

    it('CT04 - retorna 400 quando CPF duplicado', async () => {
      const res = await request(target).post('/api/v1/user')
        .send({ cpf: cpfUnico, email: 'outro_' + Date.now() + '@senai.br', password: 'senha123', name: 'Dup', data_nascimento: '2000-01-01' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/login', () => {
    it('CT05 - retorna 200 e token com credenciais validas', async () => {
      const res = await request(target).post('/api/v1/login').send({ email: emailUnico, password: 'senha123' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      tokenValido = res.body.token;
    });

    it('CT06 - retorna 401 quando senha errada', async () => {
      const res = await request(target).post('/api/v1/login').send({ email: emailUnico, password: 'errada' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Senha incorreta');
    });

    it('CT07 - retorna 401 quando email nao existe', async () => {
      const res = await request(target).post('/api/v1/login').send({ email: 'noexist@senai.br', password: 'q' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('CT08 - retorna 400 sem email ou senha', async () => {
      const res = await request(target).post('/api/v1/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/user', () => {
    it('CT09 - retorna 401 sem token', async () => {
      const res = await request(target).get('/api/v1/user');
      expect(res.status).toBe(401);
    });

    it('CT10 - retorna 403 com token invalido', async () => {
      const res = await request(target).get('/api/v1/user').set('authorization', 'invalido');
      expect(res.status).toBe(403);
    });

    it('CT11 - retorna 200 com token valido', async () => {
      const res = await request(target).get('/api/v1/user').set('authorization', tokenValido);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      const user = res.body.users.find(u => u.email === emailUnico);
      if (user) userIdCriado = user.id_usuario;
    });
  });

  describe('DELETE /api/v1/user/:id', () => {
    it('CT12 - deleta usuario existente com sucesso => 200', async () => {
      if (!userIdCriado) {
        const lista = await request(target).get('/api/v1/user').set('authorization', tokenValido);
        const user = lista.body.users?.find(u => u.email === emailUnico);
        userIdCriado = user?.id_usuario;
      }
      expect(userIdCriado).toBeDefined();
      const res = await request(target).delete('/api/v1/user/' + userIdCriado);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Usuário excluído com ID: ' + userIdCriado);
    });

    it('CT13 - retorna 404 para ID inexistente', async () => {
      const res = await request(target).delete('/api/v1/user/999999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });
});
