const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente, criarJob } = require("../helpers/cliente");
const jobFixture = require("../fixtures/job.json");
const clienteFixture = require("../fixtures/cliente.json");
const postLoginFixture = require("../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("Job vinculado a cliente existente", () => {
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

  it("Deve impedir criação de job com cliente inexistente", async () => {
    const res = await request(app)
      .post("/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...jobFixture, clienteId: 999 });
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Cliente não encontrado.");

    const lista = await request(app)
      .get("/jobs")
      .set("Authorization", `Bearer ${token}`);
    expect(lista.body).to.have.lengthOf(0);
  });

  it("Deve impedir atualização de job para cliente inexistente", async () => {
    const jobId = await criarJob(token, { ...jobFixture, clienteId });
    const res = await request(app)
      .put(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ clienteId: 999 });
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Cliente não encontrado.");

    const job = await request(app)
      .get(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(job.body).to.have.property("clienteId", clienteId);
  });

  it("Deve impedir alteração do id do job", async () => {
    const jobId = await criarJob(token, { ...jobFixture, clienteId });
    const res = await request(app)
      .put(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ id: 999 });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error");
  });
});
