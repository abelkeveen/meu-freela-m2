const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../../server");

describe("POST /clients", () => {
  let token;

  before(async function () {
    // Cria usuário e faz login para obter token
    await request(app)
      .post("/auth/register")
      .send({ login: "cliente.teste", senha: "123456" });
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "cliente.teste", senha: "123456" });
    token = res.body.token;
  });

  it("Deve cadastrar cliente com sucesso", async () => {
    const res = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Empresa Alpha Ltda", contato: "61 99999-9999" });
    expect(res.status).to.equal(201);
    expect(res.body).to.include({
      nome: "Empresa Alpha Ltda",
      contato: "61 99999-9999",
    });
    expect(res.body).to.have.property("id");
  });

  it("Deve retornar erro ao tentar cadastrar cliente sem nome", async () => {
    const res = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ contato: "61 99999-9999" });
    expect(res.status).to.equal(400);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Nome obrigatório");
  });

  it("Deve impedir cadastro de cliente com nome duplicado", async () => {
    const res = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Empresa Alpha Ltda", contato: "61 99999-9999" });
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Nome de cliente já existente");
  });
});
