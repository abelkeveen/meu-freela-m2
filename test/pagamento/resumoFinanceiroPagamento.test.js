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

describe("GET /payments/summary - Resumo Financeiro", () => {
  let token;
  let clienteId;
  let jobId;

  beforeEach(async () => {
    // Limpa pagamentos antes de cada teste
    const db = require("../../src/models/db");
    db.payments.length = 0;
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

  it("Deve calcular corretamente o total recebido e pendente", async () => {
    await criarPagamento(token, { ...pagamentoFixture.recebido, jobId });
    await criarPagamento(token, { ...pagamentoFixture.pendente, jobId });
    const res = await request(app)
      .get("/payments/summary")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property(
      "totalRecebido",
      pagamentoFixture.recebido.valor
    );
    expect(res.body).to.have.property(
      "totalPendente",
      pagamentoFixture.pendente.valor
    );
  });

  it("Deve bloquear acesso sem autenticação", async () => {
    const res = await request(app).get("/payments/summary");
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });

  it("Deve bloquear acesso com token inválido", async () => {
    const res = await request(app)
      .get("/payments/summary")
      .set("Authorization", "Bearer tokeninvalido");
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token inválido.");
  });
});
