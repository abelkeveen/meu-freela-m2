const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente, criarJob } = require("../helpers/cliente");
const jobFixture = require("../fixtures/job.json");
const clienteFixture = require("../fixtures/cliente.json");
const request = require("supertest");
const app = require("../../server");
const postLoginFixture = require("../fixtures/postLogin.json");

describe("Job", () => {
  let token;
  let clienteId;
  let jobId;

  beforeEach(async () => {
    // Cria usuário e faz login para obter token
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

  describe("PUT /jobs/{id}", () => {
    it("Deve atualizar o status do job", async () => {
      const res = await request(app)
        .put(`/jobs/${jobId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "concluido" });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("status", "concluido");
      expect(res.body.id).to.equal(jobId);
    });

    it("Deve retornar 401 ao tentar atualizar job sem token", async () => {
      const res = await request(app)
        .put("/jobs/999")
        .send({ status: "concluido" });
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token não fornecido.");
    });
  });
});
