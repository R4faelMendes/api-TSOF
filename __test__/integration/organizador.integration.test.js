import request from 'supertest';
import app from '../../src/index.js';

const target = process.env.TEST_BASE_URL || app;
const emailOrg = 'org_' + Date.now() + '@eventos.br';
let organizadorId = null;

describe('Integracao - /api/v1/organizador', () => {

  describe('POST /api/v1/organizador', () => {
    it('CT01 - cria organizador com dados validos => 201', async () => {
      const res = await request(target).post('/api/v1/organizador')
        .send({ nome: 'Org Teste', email: emailOrg, senha: 'senha123', telefone: '11999999999' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Organizador criado com sucesso');
    });

    it('CT02 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).post('/api/v1/organizador').send({ nome: 'Sem Email' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Todos os campos devem ser preenchidos');
    });

    it('CT03 - retorna 400 quando email nao tem @', async () => {
      const res = await request(target).post('/api/v1/organizador')
        .send({ nome: 'Org', email: 'emailsemarroba.br', senha: '123', telefone: '11999999999' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Email inválido. Deve conter @');
    });

    it('CT04 - retorna 400 quando telefone invalido', async () => {
      const res = await request(target).post('/api/v1/organizador')
        .send({ nome: 'Org', email: 'org@valido.br', senha: '123', telefone: '1234' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/[Tt]elefone/);
    });
  });

  describe('GET /api/v1/organizador', () => {
    it('CT05 - retorna 200 e lista de organizadores', async () => {
      const res = await request(target).get('/api/v1/organizador');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.organizadores)).toBe(true);
      const found = res.body.organizadores.find(o => o.email === emailOrg);
      if (found) organizadorId = found.id_organizador;
    });
  });

  describe('PUT /api/v1/organizador', () => {
    it('CT06 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).put('/api/v1/organizador').send({ nome: 'So nome' });
      expect(res.status).toBe(400);
    });

    it('CT07 - atualiza organizador com dados validos => 200', async () => {
      if (!organizadorId) {
        const lista = await request(target).get('/api/v1/organizador');
        const found = lista.body.organizadores.find(o => o.email === emailOrg);
        if (found) organizadorId = found.id_organizador;
      }
      expect(organizadorId).toBeDefined();

      const res = await request(target).put('/api/v1/organizador').send({
        id: organizadorId,
        nome: 'Org Atualizado',
        email: emailOrg,
        senha: 'novasenha123',
        telefone: '11988887777',
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Organizador atualizado com sucesso');
    });
  });

  describe('DELETE /api/v1/organizador/:id', () => {
    it('CT08 - retorna 404 para ID inexistente', async () => {
      const res = await request(target).delete('/api/v1/organizador/999999');
      expect(res.status).toBe(404);
    });

    it('CT09 - deleta organizador criado => 200', async () => {
      if (!organizadorId) {
        console.warn('Sem organizadorId, pulando');
        return;
      }
      const res = await request(target).delete('/api/v1/organizador/' + organizadorId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Organizador excluído com sucesso');
    });
  });
});
