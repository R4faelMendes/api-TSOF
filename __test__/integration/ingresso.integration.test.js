import request from 'supertest';
import app from '../../src/index.js';

const target = process.env.TEST_BASE_URL || app;
let ingressoId = null;
let eventoId = null;

describe('Integracao - /api/v1/ingresso', () => {

  beforeAll(async () => {
    // Busca eventos existentes ou cria um novo para os testes de ingresso
    const listaEv = await request(target).get('/api/v1/evento');
    if (listaEv.body.events && listaEv.body.events.length > 0) {
      eventoId = listaEv.body.events[0].id_evento;
    } else {
      const orgRes = await request(target).post('/api/v1/organizador')
        .send({ nome: 'Org Ingresso Teste', email: 'org_ing_' + Date.now() + '@eventos.br', senha: 'senha123', telefone: '11977776666' });
      const listaOrg = await request(target).get('/api/v1/organizador');
      const orgId = listaOrg.body.organizadores?.[0]?.id_organizador || 1;

      await request(target).post('/api/v1/evento')
        .field('nome', 'Evento Ingresso Teste')
        .field('descricao', 'Para testar ingressos')
        .field('data_hora', '2025-12-15 19:00:00')
        .field('local', 'Ginasio')
        .field('fk_id_organizador', String(orgId));

      const listaNova = await request(target).get('/api/v1/evento');
      eventoId = listaNova.body.events?.[0]?.id_evento;
    }
  });

  describe('POST /api/v1/ingresso', () => {
    it('CT01 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).post('/api/v1/ingresso').send({ preco: 50 });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Todos os campos devem ser preenchidos');
    });

    it('CT02 - cria ingresso com dados validos => 200', async () => {
      expect(eventoId).toBeDefined();
      const res = await request(target).post('/api/v1/ingresso')
        .send({ preco: 75.5, tipo: 'pista', fk_id_evento: eventoId });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Ingresso criado com sucesso');

      // Captura o id do ingresso recém-criado
      const lista = await request(target).get('/api/v1/ingresso');
      const ingressos = lista.body.ingressos || [];
      const criado = ingressos.slice().reverse().find(i => i.fk_id_evento === eventoId && i.tipo === 'pista');
      if (criado) {
        ingressoId = criado.id_ingresso;
      }
    });
  });

  describe('GET /api/v1/ingresso', () => {
    it('CT03 - retorna 200 e lista de ingressos', async () => {
      const res = await request(target).get('/api/v1/ingresso');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.ingressos)).toBe(true);
    });
  });

  describe('GET /api/v1/ingresso/evento/:id', () => {
    it('CT04 - retorna 200 com ingressos do evento', async () => {
      expect(eventoId).toBeDefined();
      const res = await request(target).get('/api/v1/ingresso/evento/' + eventoId);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.ingressos)).toBe(true);
    });

    it('CT05 - retorna 200 com lista vazia para evento sem ingressos', async () => {
      const res = await request(target).get('/api/v1/ingresso/evento/999999');
      expect(res.status).toBe(200);
      expect(res.body.ingressos).toHaveLength(0);
    });
  });

  describe('PUT /api/v1/ingresso', () => {
    it('CT06 - retorna 400 quando faltam campos', async () => {
      const res = await request(target).put('/api/v1/ingresso').send({ preco: 100 });
      expect(res.status).toBe(400);
    });

    it('CT07 - retorna 404 para ingresso inexistente', async () => {
      const res = await request(target).put('/api/v1/ingresso')
        .send({ id_ingresso: 999999, preco: 50, tipo: 'meia', fk_id_evento: 1 });
      expect(res.status).toBe(404);
    });

    it('CT08 - atualiza ingresso com dados validos => 200', async () => {
      expect(ingressoId).toBeDefined();

      const res = await request(target).put('/api/v1/ingresso').send({
        id_ingresso: ingressoId,
        preco: 90.0,
        tipo: 'meia',
        fk_id_evento: eventoId,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Ingresso atualizado com sucesso');
    });
  });

  describe('DELETE /api/v1/ingresso/:id', () => {
    it('CT09 - retorna 404 para ID inexistente', async () => {
      const res = await request(target).delete('/api/v1/ingresso/999999');
      expect(res.status).toBe(404);
    });

    it('CT10 - deleta ingresso criado => 200', async () => {
      expect(ingressoId).toBeDefined();
      const res = await request(target).delete('/api/v1/ingresso/' + ingressoId);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Ingresso excluído com sucesso');
    });
  });
});
