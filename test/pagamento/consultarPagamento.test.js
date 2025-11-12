const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente, criarJob } = require("../helpers/cliente");
const { criarPagamento } = require("../helpers/pagamento");
const jobFixture = require("../fixtures/job.json");
const clienteFixture = require("../fixtures/cliente.json");
const pagamentoFixture = require("../fixtures/pagamento.json");
const postLoginFixture = require("../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("GET /payments", () => {
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
      ...pagamentoFixture.pendente,
      jobId,
    });
    pagamentoId = pagRes.body.id;
  });

  it("Deve exibir o nome do cliente associado ao pagamento", async () => {
    const res = await request(app)
      .get("/payments")
      .set("Authorization", `Bearer ${token}`);
    const pagamento = res.body.find((p) => p.id === pagamentoId);
    expect(pagamento).to.have.property("clienteNome").that.is.a("string");
  });

  it("Deve retornar 401 quando o token for invalido ou nao informado", async () => {
    const res = await request(app).get("/payments");
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });
});
