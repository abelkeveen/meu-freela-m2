const chai = require("chai");
const expect = chai.expect;
const { registerUser, limparUsuarios } = require("../helpers/autenticacao");
const usuarios = require("../fixtures/postLogin.json");

describe("POST /auth/register", () => {
  beforeEach(async () => {
    await limparUsuarios();
  });

  it("Deve retornar 201 e um novo usuário cadastrado com sucesso", async () => {
    const res = await registerUser(
      usuarios.valido.login,
      usuarios.valido.senha
    );
    expect(res).to.have.property("status", 201);
    expect(res.body).to.have.property("login", usuarios.valido.login);
  });

  it("Deve retornar 400 quando login e senha não forem informados", async () => {
    const res = await registerUser("", "");
    expect(res.status).to.equal(400);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Login e senha obrigatórios");
  });

  it("Deve retornar 409 quando o usuário já existir.", async () => {
    await registerUser(usuarios.valido.login, usuarios.valido.senha); // garante que existe
    const res = await registerUser(
      usuarios.valido.login,
      usuarios.valido.senha
    );
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Usuário já existe");
  });
});
