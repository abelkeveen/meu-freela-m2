const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../../helpers/autenticacao");
const { criarCliente, criarJob } = require("../../helpers/cliente");
const { criarPagamento } = require("../../helpers/pagamento");
const jobFixture = require("../../fixtures/job.json");
const clienteFixture = require("../../fixtures/cliente.json");
const pagamentoFixture = require("../../fixtures/pagamento.json");
const postLoginFixture = require("../../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("POST /payments", () => {
  let token;
  let clienteId;
  let jobId;

  beforeEach(async () => {
    await registerUser(
      postLoginFixture.valido.login,
      postLoginFixture.valido.senha
    );
    token = await obterToken(
      postLoginFixture.valido.login,
      postLoginFixture.valido.senha
    );
    const clienteRes = await criarCliente(token, clienteFixture.valido);
    clienteId = clienteRes.body.id;
    jobId = await criarJob(token, { ...jobFixture, clienteId });
  });

  it("Deve criar um pagamento vinculado a um job existente", async () => {
    const res = await criarPagamento(token, {
      ...pagamentoFixture.valido,
      jobId,
    });
    expect(res.status).to.equal(201);
    expect(res.body).to.include({
      jobId,
      valor: pagamentoFixture.valido.valor,
      recebido: pagamentoFixture.valido.recebido,
    });
    expect(res.body).to.have.property("id");
  });

  it("Deve impedir criação de pagamento sem job vinculado", async () => {
    const res = await criarPagamento(token, {
      valor: pagamentoFixture.valido.valor,
      recebido: false,
      data: pagamentoFixture.valido.data,
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error").that.includes("jobId");
  });

  it("Deve validar obrigatoriedade dos campos ao criar pagamento", async () => {
    const res = await criarPagamento(token, { jobId });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });

  it("Deve retornar 401 ao tentar atualizar status do pagamento sem token", async () => {
    const res = await request(app)
      .put(`/payments/999/status`)
      .send({ recebido: true });
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });
});
