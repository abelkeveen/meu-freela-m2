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
const db = require("../../src/models/db");

describe("Regras de negócio de pagamentos", () => {
  let token;
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
    jobId = await criarJob(token, {
      ...jobFixture,
      clienteId: clienteRes.body.id,
    });
  });

  describe("POST /payments", () => {
    it("Deve impedir pagamento vinculado a job inexistente", async () => {
      const res = await criarPagamento(token, {
        ...pagamentoFixture.valido,
        jobId: 999,
      });
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("error", "Job não encontrado.");
      expect(db.payments).to.have.lengthOf(0);
    });

    it("Deve exigir o status (recebido) do pagamento", async () => {
      const { recebido, ...semStatus } = pagamentoFixture.valido;
      const res = await criarPagamento(token, { ...semStatus, jobId });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error").that.includes("recebido");
    });

    it("Deve exigir que o status (recebido) seja booleano", async () => {
      const res = await criarPagamento(token, {
        ...pagamentoFixture.valido,
        recebido: "sim",
        jobId,
      });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property(
        "error",
        "Campo 'recebido' deve ser booleano."
      );
    });

    it("Deve exigir a data do pagamento", async () => {
      const { data, ...semData } = pagamentoFixture.valido;
      const res = await criarPagamento(token, { ...semData, jobId });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error").that.includes("data");
    });

    it("Deve aceitar pagamento pendente (recebido = false)", async () => {
      const res = await criarPagamento(token, {
        ...pagamentoFixture.pendente,
        jobId,
      });
      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        recebido: false,
        data: pagamentoFixture.pendente.data,
      });
    });
  });

  describe("GET /payments/summary", () => {
    it("Deve considerar apenas pagamentos válidos no resumo", async () => {
      await criarPagamento(token, { ...pagamentoFixture.recebido, jobId });
      await criarPagamento(token, { ...pagamentoFixture.pendente, jobId });
      // Pagamentos inválidos (job inexistente) inseridos direto na base,
      // simulando dados legados que não passaram pela API.
      db.payments.push(
        { id: 900, jobId: 999, valor: 5000, recebido: true, data: "2025-11-07" },
        { id: 901, jobId: 999, valor: 7000, recebido: false, data: "2025-11-07" }
      );

      const res = await request(app)
        .get("/payments/summary")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        totalRecebido: pagamentoFixture.recebido.valor,
        totalPendente: pagamentoFixture.pendente.valor,
      });
    });

    it("Deve ignorar pagamentos cujo cliente não existe mais", async () => {
      await criarPagamento(token, { ...pagamentoFixture.recebido, jobId });
      db.clients.length = 0; // cliente do job removido fora da API

      const res = await request(app)
        .get("/payments/summary")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ totalRecebido: 0, totalPendente: 0 });
    });
  });
});
