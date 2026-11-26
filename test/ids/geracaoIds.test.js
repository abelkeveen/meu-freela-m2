const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../helpers/autenticacao");
const { criarCliente, criarJob } = require("../helpers/cliente");
const jobFixture = require("../fixtures/job.json");
const postLoginFixture = require("../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("Geração de IDs", () => {
  let token;

  beforeEach(async () => {
    await registerUser(
      postLoginFixture.valido.login,
      postLoginFixture.valido.senha
    );
    token = await obterToken(
      postLoginFixture.valido.login,
      postLoginFixture.valido.senha
    );
  });

  it("Não deve repetir id de cliente após remoção", async () => {
    const c1 = await criarCliente(token, { nome: "Cliente 1" });
    const c2 = await criarCliente(token, { nome: "Cliente 2" });
    await request(app)
      .delete(`/clients/${c1.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const c3 = await criarCliente(token, { nome: "Cliente 3" });
    expect(c3.status).to.equal(201);
    expect(c3.body.id).to.not.equal(c2.body.id);
    expect(c3.body.id).to.not.equal(c1.body.id);

    const lista = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`);
    const ids = lista.body.map((c) => c.id);
    expect(new Set(ids).size).to.equal(ids.length);
  });

  it("Não deve repetir id de job após remoção", async () => {
    const cliente = await criarCliente(token, { nome: "Cliente" });
    const clienteId = cliente.body.id;
    const j1 = await criarJob(token, { ...jobFixture, clienteId });
    const j2 = await criarJob(token, { ...jobFixture, clienteId });
    await request(app)
      .delete(`/jobs/${j1}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    const j3 = await criarJob(token, { ...jobFixture, clienteId });
    expect(j3).to.not.equal(j2);
    expect(j3).to.not.equal(j1);

    const lista = await request(app)
      .get("/jobs")
      .set("Authorization", `Bearer ${token}`);
    const ids = lista.body.map((j) => j.id);
    expect(new Set(ids).size).to.equal(ids.length);
  });
});
