const chai = require("chai");
const expect = chai.expect;
const { registerUser, obterToken } = require("../../helpers/autenticacao");
const { criarCliente } = require("../../helpers/cliente");
const clientes = require("../../fixtures/cliente.json");

describe("Clientes", () => {
  let token;
  let clienteId;

  const usuario = require("../../fixtures/postLogin.json").valido;
  beforeEach(async () => {
    await registerUser(usuario.login, usuario.senha);
    token = await obterToken(usuario.login, usuario.senha);
    const clienteRes = await criarCliente(token, clientes.valido);
    clienteId = clienteRes.body.id;
  });

  describe("GET /clients", () => {
    it("Deve retornar 200 e uma lista de clientes", async () => {
      const res = await require("supertest")(require("../../server"))
        .get("/clients")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
      const cliente = res.body.find((c) => c.id === clienteId);
      expect(cliente).to.include(clientes.valido);
    });

    it("Deve retornar 401 quando o token não for fornecido", async () => {
      const res = await require("supertest")(require("../../server")).get(
        "/clients"
      );
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token não fornecido.");
    });

    it("Deve retornar 401 quando o token for inválido", async () => {
      const res = await require("supertest")(require("../../server"))
        .get("/clients")
        .set("Authorization", "Bearer tokeninvalido");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token inválido.");
    });
  });
  describe("GET /clients/{id}", () => {
    before(async () => {
      // Cria usuário e faz login para obter token
      await require("supertest")(require("../../server"))
        .post("/auth/register")
        .send({ login: "buscar.cliente", senha: "123456" });
      const res = await require("supertest")(require("../../server"))
        .post("/auth/login")
        .send({ login: "buscar.cliente", senha: "123456" });
      token = res.body.token;
      // Cria cliente para buscar depois
      const clienteRes = await require("supertest")(require("../../server"))
        .post("/clients")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Empresa Alpha Ltda", contato: "61 99999-9999" });
      clienteId = clienteRes.body.id;
    });

    it("Deve retornar 200 e os dados do cliente", async () => {
      const res = await require("supertest")(require("../../server"))
        .get(`/clients/${clienteId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.include({
        id: clienteId,
        nome: "Empresa Alpha Ltda",
        contato: "61 99999-9999",
      });
    });

    it("Deve retornar 401 quando o token inválido ou não fornecido", async () => {
      const res = await require("supertest")(require("../../server")).get(
        `/clients/${clienteId}`
      );
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token não fornecido.");
    });

    it("Deve retornar 401 quando o token inválido ou não fornecido", async () => {
      const res = await require("supertest")(require("../../server"))
        .get(`/clients/${clienteId}`)
        .set("Authorization", "Bearer tokeninvalido");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Token inválido.");
    });

    it("Deve retornar 404 quando o cliente não for encontrado", async () => {
      const res = await require("supertest")(require("../../server"))
        .get(`/clients/999999`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).to.equal(404);
    });
  });
});
