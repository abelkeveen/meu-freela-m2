const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../../server");

describe("Atualização de Cliente", () => {
  let token;
  let clienteId;

  before(async function () {
    // Cria usuário e faz login para obter token
    await request(app)
      .post("/auth/register")
      .send({ login: "cliente.teste", senha: "123456" });
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "cliente.teste", senha: "123456" });
    token = res.body.token;
    // Cadastra cliente para atualizar
    const clienteRes = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Atualizar", contato: "61 99999-9999" });
    clienteId = clienteRes.body.id;
  });

  it("Deve atualizar dados de cliente (exceto ID)", async () => {
    const res = await request(app)
      .put(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Atualizado", contato: "61 98888-8888" });
    expect(res.status).to.equal(200);
    expect(res.body).to.include({
      nome: "Cliente Atualizado",
      contato: "61 98888-8888",
    });
    expect(res.body.id).to.equal(clienteId);
  });

  it("Deve impedir alteração do ID do cliente", async () => {
    const res = await request(app)
      .put(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ id: 999, nome: "Cliente Hackeado" });

    expect(res.status).to.equal(400);
  });
});
