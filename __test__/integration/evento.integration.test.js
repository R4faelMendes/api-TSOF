import request from 'supertest';
import app from '../../src/index.js';

const target = process.env.TEST_BASE_URL || app;
let eventoId = null;
let organizadorId = null;

describe('Integracao - /api/v1/evento', () => {

  beforeAll(async () => {
    const orgRes = await request(target).post('/api/v1/organizador')
      .send({ nome: 'Org Evento Teste', email: 'org_ev_' + Date.now() + '@eventos.br', senha: 'senha123', telefone: '11988887777' });
    if (orgRes.status === 201) {
      const lista = await request(target).get('/api/v1/organizador');
      const orgs = lista.body.organizadores;
      if (orgs && orgs.length > 0) organizadorId = orgs[orgs.length - 1].id_organizador;
    }
  });

  describe('POST /api/v1/evento', () => {
    it('CT01 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).post('/api/v1/evento').send({ nome: 'Apenas nome' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Todos os campos devem ser preenchidos');
    });

    it('CT02 - cria evento com dados validos => 201', async () => {
      if (!organizadorId) { console.warn('Sem organizadorId'); return; }
      const res = await request(target).post('/api/v1/evento')
        .field('nome', 'Show de Teste')
        .field('descricao', 'Descricao do evento')
        .field('data_hora', '2025-12-01 20:00:00')
        .field('local', 'Auditorio Central')
        .field('fk_id_organizador', String(organizadorId));
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Evento criado com sucesso');
    });
  });

  describe('GET /api/v1/evento', () => {
    it('CT03 - retorna 200 e lista de eventos', async () => {
      const res = await request(target).get('/api/v1/evento');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.events)).toBe(true);
      const eventos = res.body.events;
      if (eventos.length > 0) eventoId = eventos[eventos.length - 1].id_evento;
    });
  });

  describe('PUT /api/v1/evento', () => {
    it('CT04 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).put('/api/v1/evento').send({ nome: 'So nome' });
      expect(res.status).toBe(400);
    });

    it('CT05 - retorna 404 para evento inexistente', async () => {
      const res = await request(target).put('/api/v1/evento')
        .send({ id_evento: 999999, nome: 'X', descricao: 'D', data_hora: '2025-12-01 20:00:00', local: 'L', fk_id_organizador: 1 });
      expect(res.status).toBe(404);
    });

    it('CT06 - atualiza evento com dados validos => 200', async () => {
      if (!eventoId) {
        const lista = await request(target).get('/api/v1/evento');
        const eventos = lista.body.events;
        if (eventos && eventos.length > 0) eventoId = eventos[eventos.length - 1].id_evento;
      }
      expect(eventoId).toBeDefined();

      const res = await request(target).put('/api/v1/evento').send({
        id_evento: eventoId,
        nome: 'Show de Teste Atualizado',
        descricao: 'Nova descricao atualizada',
        data_hora: '2025-12-02 21:00:00',
        local: 'Auditorio Central Reformado',
        fk_id_organizador: organizadorId || 1,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Evento atualizado com sucesso');
    });
  });

  describe('DELETE /api/v1/evento/:id', () => {
    it('CT07 - retorna 404 para ID inexistente', async () => {
      const res = await request(target).delete('/api/v1/evento/999999');
      expect(res.status).toBe(404);
    });

    it('CT08 - deleta evento criado => 200', async () => {
      if (!eventoId) { console.warn('Sem eventoId'); return; }
      const res = await request(target).delete('/api/v1/evento/' + eventoId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Evento excluído com sucesso');
    });
  });
});
