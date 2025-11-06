const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../../server");

describe("DELETE /clients", () => {
  let token;

  before(async () => {
    // Cria usuário e faz login para obter token
    await request(app)
      .post("/auth/register")
      .send({ login: "remover.teste", senha: "123456" });
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "remover.teste", senha: "123456" });
    token = res.body.token;
  });

  it("Deve impedir exclusão de cliente com jobs vinculados", async () => {
    // Cria cliente
    const clienteRes = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Com Job", contato: "61 90000-0001" });
    const clienteId = clienteRes.body.id;

    // Cria job vinculado ao cliente
    await request(app)
      .post("/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId,
        descricao: "Job Teste",
        valor: 1000,
        status: "pendente",
        data: new Date().toISOString(),
      });

    // Tenta remover cliente
    const res = await request(app)
      .delete(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Não é permitido remover cliente com jobs vinculados");
  });

  it("Deve impedir exclusão de cliente com pagamentos vinculados", async () => {
    // Cria cliente
    const clienteRes = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Com Pagamento", contato: "61 90000-0002" });
    const clienteId = clienteRes.body.id;

    // Cria job vinculado ao cliente
    const jobRes = await request(app)
      .post("/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId,
        descricao: "Job Pagamento",
        valor: 500,
        status: "pendente",
        data: new Date().toISOString(),
      });
    const jobId = jobRes.body.id;

    // Cria pagamento vinculado ao job
    await request(app)
      .post("/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobId,
        valor: 500,
        recebido: false,
        data: new Date().toISOString(),
      });

    // Tenta remover cliente
    const res = await request(app)
      .delete(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Não é permitido remover cliente com jobs vinculados");
  });

  it("Deve remover cliente sem vínculos", async () => {
    // Cria cliente sem vínculos
    const clienteRes = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Sem Vinculo", contato: "61 90000-0003" });
    const clienteId = clienteRes.body.id;

    // Remove cliente
    const res = await request(app)
      .delete(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(204);
  });
});
