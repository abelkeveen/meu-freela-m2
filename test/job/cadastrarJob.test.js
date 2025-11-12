const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente } = require("../helpers/cliente");
const jobFixture = require("../fixtures/job.json");
const clienteFixture = require("../fixtures/cliente.json");
const postLoginFixture = require("../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("Job", () => {
  let token;
  let clienteId;

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
  });
  describe("POST /jobs", () => {
    it("Deve criar job com sucesso", async () => {
      const res = await request(app)
        .post("/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...jobFixture, clienteId });
      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        descricao: jobFixture.descricao,
        valor: jobFixture.valor,
        status: jobFixture.status,
      });
      expect(res.body).to.have.property("id");
      expect(res.body).to.have.property("clienteId", clienteId);
    });

    it("Deve impedir criação de job sem cliente vinculado", async () => {
      const res = await request(app)
        .post("/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          descricao: "Job Sem Cliente",
          valor: 500,
          status: "pendente",
          data: jobFixture.data,
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error").that.includes("clienteId");
    });

    it("Deve impedir criação de job com campos obrigatórios ausentes", async () => {
      const res = await request(app)
        .post("/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          clienteId,
          descricao: "", // valor ausente
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("Deve retornar 401 ao tentar cadastrar job sem token", async () => {
      const res = await request(app).post("/jobs").send({
        descricao: "Job Sem Token",
        valor: 100,
        status: "pendente",
        data: jobFixture.data,
      });
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token não fornecido.");
    });
  });
});
