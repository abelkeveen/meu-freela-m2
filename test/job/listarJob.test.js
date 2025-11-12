const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente, criarJob } = require("../helpers/cliente");
const jobFixture = require("../fixtures/job.json");
const clienteFixture = require("../fixtures/cliente.json");
const postLoginFixture = require("../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("Jobs", () => {
  let token;
  let clienteId;
  let jobId;

  before(async () => {
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

  describe("GET /jobs", () => {
    it("Deve retornar 200 e uma lista de jobs", async () => {
      const res = await request(app)
        .get("/jobs")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
      const job = res.body.find((j) => j.id === jobId);
      expect(job).to.include({
        clienteId,
        descricao: jobFixture.descricao,
        valor: jobFixture.valor,
        status: jobFixture.status,
      });
    });

    it("Deve retornar 401 quando o token não for fornecido", async () => {
      const res = await request(app).get("/jobs");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token não fornecido.");
    });

    it("Deve retornar 401 quando o token for inválido", async () => {
      const res = await request(app)
        .get("/jobs")
        .set("Authorization", "Bearer tokeninvalido");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token inválido.");
    });

    describe("GET /jobs/{id}", () => {
      it("Deve retornar 200 e os dados do job", async () => {
        const res = await request(app)
          .get(`/jobs/${jobId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
          id: jobId,
          clienteId,
          descricao: jobFixture.descricao,
          valor: jobFixture.valor,
          status: jobFixture.status,
        });
        expect(res.body).to.have.property("data");
      });

      it("Deve retornar 401 quando o token não for fornecido", async () => {
        const res = await request(app).get(`/jobs/${jobId}`);
        expect(res.status).to.equal(401);
        expect(res.body.error).to.equal("Token não fornecido.");
      });

      it("Deve retornar 401 quando o token for inválido", async () => {
        const res = await request(app)
          .get(`/jobs/${jobId}`)
          .set("Authorization", "Bearer tokeninvalido");
        expect(res.status).to.equal(401);
        expect(res.body.error).to.equal("Token inválido.");
      });

      it("Deve retornar 404 quando o job não for encontrado", async () => {
        const res = await request(app)
          .get(`/jobs/999999`)
          .set("Authorization", `Bearer ${token}`);
        expect(res.status).to.equal(404);
      });
    });
  });
});
