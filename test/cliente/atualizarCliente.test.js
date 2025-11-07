const chai = require("chai");
const expect = chai.expect;
const { registerUser, obterToken } = require("../../helpers/autenticacao");
const { criarCliente, atualizarCliente } = require("../../helpers/cliente");
const clientes = require("../../fixtures/cliente.json");

describe("PUT /clients/{id}", () => {
  let token;
  let clienteId;

  const usuario = require("../../fixtures/postLogin.json").valido;
  
  beforeEach(async () => {
    await registerUser(usuario.login, usuario.senha);
    token = await obterToken(usuario.login, usuario.senha);
    const res = await criarCliente(token, clientes.valido);
    clienteId = res.body.id;
  });

  it("Deve atualizar dados de cliente (exceto ID)", async () => {
    const res = await atualizarCliente(token, clienteId, clientes.atualizado);
    expect(res.status).to.equal(200);
    expect(res.body).to.include(clientes.atualizado);
    expect(res.body.id).to.equal(clienteId);
  });

  it("Deve impedir alteração do ID do cliente", async () => {
    const res = await atualizarCliente(token, clienteId, {
      id: 999,
      nome: "Cliente Hackeado",
    });
    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(
      "O identificador do cliente não pode ser alterado."
    );
  });

  it("Deve retornar 401 quando o token não for fornecido", async () => {
    const res = await atualizarCliente("", clienteId, clientes.valido);
    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token não fornecido.");
  });
});
