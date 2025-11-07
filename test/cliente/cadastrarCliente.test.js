const chai = require("chai");
const expect = chai.expect;
const { registerUser, obterToken } = require("../../helpers/autenticacao");
const { criarCliente } = require("../../helpers/cliente");
const clientes = require("../../fixtures/cliente.json");

describe("POST /clients", () => {
  let token;
  const usuario = require("../../fixtures/postLogin.json").valido;

  beforeEach(async () => {
    await registerUser(usuario.login, usuario.senha);
    token = await obterToken(usuario.login, usuario.senha);
  });

  it("Deve cadastrar cliente com sucesso", async () => {
    const res = await criarCliente(token, clientes.valido);
    expect(res.status).to.equal(201);
    expect(res.body).to.include(clientes.valido);
    expect(res.body).to.have.property("id");
  });

  it("Deve retornar erro ao tentar cadastrar cliente sem nome", async () => {
    const res = await criarCliente(token, { contato: clientes.valido.contato });
    expect(res.status).to.equal(400);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Nome obrigatório");
  });

  it("Deve impedir cadastro de cliente com nome duplicado", async () => {
    await criarCliente(token, clientes.valido); // cadastra uma vez
    const res = await criarCliente(token, clientes.valido); // tenta duplicar
    expect(res.status).to.equal(409);
    expect(res.body)
      .to.have.property("error")
      .that.includes("Nome de cliente já existente");
  });

  it("Deve retornar 401 quando o token não for fornecido", async () => {
    const res = await criarCliente("", clientes.valido);
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });
});
