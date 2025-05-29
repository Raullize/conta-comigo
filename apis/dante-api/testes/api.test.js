const request = require('supertest');
const app = require('../index'); 

let usuarioId;
let instituicaoId;
let contaId;
let transacaoId;

describe('Testes da API', () => {

  it('deve criar um usuário', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send({ nome: 'Teste Usuário', email: 'teste@exemplo.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    usuarioId = res.body.id;
  });

  it('deve criar uma instituição', async () => {
    const res = await request(app)
      .post('/instituicoes')
      .send({ nome: 'Banco XPTO' });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    instituicaoId = res.body.id;
  });

  it('deve criar uma conta para o usuário', async () => {
    const res = await request(app)
      .post(`/usuarios/${usuarioId}/contas`)
      .send({ instituicaoId: instituicaoId, saldo: 1000 });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    contaId = res.body.id;
  });

  it('deve criar uma transação para o usuário', async () => {
    const res = await request(app)
      .post(`/usuarios/${usuarioId}/transacoes`)
      .send({ contaId:contaId, tipo: 'credito', valor: 500, descricao: 'Depósito inicial' });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
    transacaoId = res.body.id;
  });

  it('deve buscar o saldo total do usuário', async () => {
    const res = await request(app)
      .get(`/usuarios/${usuarioId}/saldo`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('saldoTotal');
  });

  it('deve retornar o extrato do usuário', async () => {
    const res = await request(app)
      .get(`/usuarios/${usuarioId}/extrato`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.transacoes)).toBe(true);
  });

  it('deve atualizar o usuário', async () => {
    const res = await request(app)
      .put(`/usuarios/${usuarioId}`)
      .send({ nome: 'Nome Atualizado', email: 'atualizado@exemplo.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe('Nome Atualizado');
  });

  it('deve atualizar a conta', async () => {
    const res = await request(app)
      .put(`/contas/${contaId}`)
      .send({ saldo: 2000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.saldo).toBe(2000);
  });

  it('deve atualizar a instituição', async () => {
    const res = await request(app)
      .put(`/instituicoes/${instituicaoId}`)
      .send({ nome: 'Banco Atualizado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe('Banco Atualizado');
  });

  it('deve deletar a transação', async () => {
    const res = await request(app)
      .delete(`/transacoes/${transacaoId}`);

    expect(res.statusCode).toBe(204);
  });

  it('deve deletar a conta', async () => {
    const res = await request(app)
      .delete(`/contas/${contaId}`);

    expect(res.statusCode).toBe(204);
  });

  it('deve deletar a instituição', async () => {
    const res = await request(app)
      .delete(`/instituicoes/${instituicaoId}`);

    expect(res.statusCode).toBe(204);
  });

  it('deve deletar o usuário', async () => {
    const res = await request(app)
      .delete(`/usuarios/${usuarioId}`);

    expect(res.statusCode).toBe(204);
  });

});

// Fechar conexão após os testes
const { sequelize } = require('../bd/models');
afterAll(async () => {
  await sequelize.close();
});
