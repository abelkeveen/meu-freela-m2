const chai = require("chai");
const expect = chai.expect;
const { registerUser, obterToken } = require("../helpers/autenticacao");
const { criarCliente } = require("../helpers/cliente");
const clientes = require("../fixtures/cliente.json");

describe("DELETE /clients", () => {
  let token;

  const usuario = require("../fixtures/postLogin.json").valido;
  beforeEach(async () => {
    await registerUser(usuario.login, usuario.senha);
    token = await obterToken(usuario.login, usuario.senha);
  });

  it("Deve remover cliente sem vínculos", async () => {
    const clienteRes = await criarCliente(token, {
      nome: "Cliente Sem Vinculo",
      contato: "61 90000-0003",
    });
    const clienteId = clienteRes.body.id;
    const res = await require("supertest")(require("../../server"))
      .delete(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(204);
  });

  it("Deve impedir exclusão de cliente com jobs vinculados", async () => {
    const clienteRes = await criarCliente(token, {
      nome: "Cliente Com Job",
      contato: "61 90000-0001",
    });
    const clienteId = clienteRes.body.id;
    await require("supertest")(require("../../server"))
      .post("/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId,
        descricao: "Job Teste",
        valor: 1000,
        status: "pendente",
        data: new Date().toISOString(),
      });
    const res = await require("supertest")(require("../../server"))
      .delete(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Não é permitido remover cliente com jobs vinculados");
  });

  it("Deve impedir exclusão de cliente com pagamentos vinculados", async () => {
    const clienteRes = await criarCliente(token, {
      nome: "Cliente Com Pagamento",
      contato: "61 90000-0002",
    });
    const clienteId = clienteRes.body.id;
    const jobRes = await require("supertest")(require("../../server"))
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
    await require("supertest")(require("../../server"))
      .post("/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        jobId,
        valor: 500,
        recebido: false,
        data: new Date().toISOString(),
      });
    const res = await require("supertest")(require("../../server"))
      .delete(`/clients/${clienteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Não é permitido remover cliente com jobs vinculados");
  });

  it("Deve retornar 401 quando o token não for fornecido", async () => {
    const clienteRes = await criarCliente(token, {
      nome: "Empresa Sem Token",
      contato: "61 99999-9999",
    });
    const clienteId = clienteRes.body.id;
    const res = await require("supertest")(require("../../server")).delete(
      `/clients/${clienteId}`
    );
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });
});
