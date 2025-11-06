const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../../server");

describe("POST /auth/register", () => {
  it("deve retornar 201 e um novo usuário cadastrado com sucesso", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ login: "julio.lima", senha: "123456" });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("login", "julio.lima");
  });

  it("Deve retornar 400 quando login e senha não forem informados", async () => {
    const res = await request(app).post("/auth/register").send({});
    expect(res.status).to.equal(400);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Login e senha obrigatórios");
  });

  it("Deve retornar 409 quando o usuário já existir.", async () => {
    // Primeiro cadastro
    await request(app)
      .post("/auth/register")
      .send({ login: "usuario.duplicado", senha: "123456" });
    // Segundo cadastro com o mesmo login
    const res = await request(app)
      .post("/auth/register")
      .send({ login: "usuario.duplicado", senha: "123456" });
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Usuário já existe");
  });
});
