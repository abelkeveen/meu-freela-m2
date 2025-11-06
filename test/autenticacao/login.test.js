const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../../server");

describe("Login de Usuário", function () {
  before(async function () {
    // Garante que o usuário existe antes do teste de login
    await request(app)
      .post("/auth/register")
      .send({ login: "julio.lima", senha: "123456" });
  });

  it("Deve autenticar com sucesso com credenciais válidas", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "julio.lima", senha: "123456" });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token").that.is.a("string");
  });

  it("Deve falhar ao autenticar com senha incorreta", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "julio.lima", senha: "123455" });
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("error").that.includes("Senha incorreta");
  });

  it("Deve falhar ao autenticar com login inexistente", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ login: "juliolima", senha: "123456" });
    expect(res.status).to.equal(404);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Usuário não encontrado");
  });

  it("Deve validar campos obrigatórios na autenticação", async () => {
    const res = await request(app).post("/auth/login").send({ login: "" }); // senha ausente
    expect(res.status).to.equal(400);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Login e senha obrigatórios");
  });
});
