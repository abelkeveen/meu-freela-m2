const request = require("supertest");
const path = require("path");
const app = require(path.resolve(__dirname, "../../server.js"));

const criarCliente = async (token, cliente) => {
  const req = request(app).post("/clients");
  if (token) req.set("Authorization", `Bearer ${token}`);
  return await req.send(cliente);
};

const atualizarCliente = async (token, id, dados) => {
  const req = request(app).put(`/clients/${id}`);
  if (token) req.set("Authorization", `Bearer ${token}`);
  return await req.send(dados);
};

const criarJob = async (token, jobData) => {
  const res = await request(app)
    .post("/jobs")
    .set("Authorization", `Bearer ${token}`)
    .send(jobData);
  return res.body.id;
};

module.exports = { criarCliente, atualizarCliente, criarJob };
