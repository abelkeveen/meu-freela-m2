const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente, criarJob } = require("../helpers/cliente");
const {
  criarPagamento,
  atualizarStatusPagamento,
} = require("../helpers/pagamento");
const jobFixture = require("../fixtures/job.json");
const clienteFixture = require("../fixtures/cliente.json");
const pagamentoFixture = require("../fixtures/pagamento.json");
const postLoginFixture = require("../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("PUT/ payments/{id}/status", () => {
  let token;
  let clienteId;
  let jobId;
  let pagamentoId;

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
    const pagRes = await criarPagamento(token, {
      ...pagamentoFixture.valido,
      jobId,
    });
    pagamentoId = pagRes.body.id;
  });

  it("Deve atualizar o status do pagamento para recebido", async () => {
    const res = await atualizarStatusPagamento(token, pagamentoId, true);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("recebido", true);
  });

  it("Deve atualizar o status de recebido para pendente", async () => {
    await atualizarStatusPagamento(token, pagamentoId, true);
    const res = await atualizarStatusPagamento(token, pagamentoId, false);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("recebido", false);
  });

  it("Deve garantir que a alteração de status não afete vínculo com job e cliente", async () => {
    const res = await atualizarStatusPagamento(token, pagamentoId, true);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("jobId", jobId);
    const listRes = await request(app)
      .get("/payments")
      .set("Authorization", `Bearer ${token}`);
    const pagamento = listRes.body.find((p) => p.id === pagamentoId);
    expect(pagamento).to.have.property("clienteNome");
  });

  it("Deve retornar 401 ao tentar cadastrar pagamento sem token", async () => {
    const res = await request(app)
      .post("/payments")
      .send({ ...pagamentoFixture.valido, jobId: 1 });
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });
});
