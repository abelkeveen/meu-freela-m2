const chai = require("chai");
const expect = chai.expect;
const { registerUser, loginUser } = require("../../helpers/autenticacao");
const usuarios = require("../../fixtures/postLogin.json");

describe("Post /auth/login", function () {
  beforeEach(async function () {
    await registerUser(usuarios.valido.login, usuarios.valido.senha);
  });

  it("Deve autenticar com sucesso com credenciais válidas", async () => {
    const res = await loginUser(usuarios.valido.login, usuarios.valido.senha);
    expect(res.status).to.equal(200);
    expect(res.body.token).to.be.a("string");
  });

  it("Deve falhar ao autenticar com senha incorreta", async () => {
    const res = await loginUser(
      usuarios.invalido.login,
      usuarios.invalido.senha
    );
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Senha incorreta.");
    //expect(res.body).to.have.property("error").that.includes("Senha incorreta");
  });

  it("Deve falhar ao autenticar com login inexistente", async () => {
    const res = await loginUser(
      usuarios.inexistente.login,
      usuarios.inexistente.senha
    );
    expect(res.status).to.equal(404);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Usuário não encontrado");
  });

  it("Deve validar campos obrigatórios na autenticação", async () => {
    const res = await loginUser("", "");
    expect(res.status).to.equal(400);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Login e senha obrigatórios");
  });
});
