const request = require("supertest");
const app = require("../server");

const registerUser = async (login, senha) => {
  return await request(app).post("/auth/register").send({ login, senha });
};

const loginUser = async (login, senha) => {
  return await request(app).post("/auth/login").send({ login, senha });
};

const obterToken = async (login, senha) => {
  const res = await loginUser(login, senha);
  return res.body.token;
};

const limparUsuarios = async () => {
  const db = require("../src/models/db");
  db.users.length = 0;
};

module.exports = { registerUser, loginUser, obterToken, limparUsuarios };
