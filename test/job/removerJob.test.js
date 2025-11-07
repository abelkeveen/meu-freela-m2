const chai = require("chai");
const expect = chai.expect;
const { obterToken, registerUser } = require("../../helpers/autenticacao");
const { criarCliente, criarJob } = require("../../helpers/cliente");
const jobFixture = require("../../fixtures/job.json");
const clienteFixture = require("../../fixtures/cliente.json");
const postLoginFixture = require("../../fixtures/postLogin.json");
const request = require("supertest");
const app = require("../../server");

describe("DELETE /jobs/{id}", () => {
  let token;
  let clienteId;

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
  });

  it("Deve impedir exclusão de job com pagamentos vinculados", async () => {
    const jobId = await criarJob(token, { ...jobFixture, clienteId });
    await request(app)
      .post("/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobId,
        valor: jobFixture.valor,
        recebido: false,
        data: jobFixture.data,
      });
    const res = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("pagamentos vinculados");
  });

  it("Deve remover job sem pagamentos vinculados", async () => {
    const jobId = await criarJob(token, {
      ...jobFixture,
      clienteId,
      descricao: "Job Sem Pagamento",
      valor: 500,
    });
    const res = await request(app)
      .delete(`/jobs/${jobId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(204);
  });

  it("Deve retornar 401 ao tentar remover job sem token", async () => {
    const res = await request(app).delete("/jobs/999").send();
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });

  it("Deve retornar 404 ao tentar remover um job inexistente", async () => {
    const res = await request(app)
      .delete("/jobs/999999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(404);
    expect(res.body.error).to.equal("Job não encontrado.");
  });
});
