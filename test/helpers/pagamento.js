const request = require("supertest");
const app = require("../../server.js");

const criarPagamento = async (token, pagamento) => {
  return await request(app)
    .post("/payments")
    .set("Authorization", `Bearer ${token}`)
    .send(pagamento);
};

const atualizarStatusPagamento = async (token, id, recebido) => {
  return await request(app)
    .put(`/payments/${id}/status`)
    .set("Authorization", `Bearer ${token}`)
    .send({ recebido });
};

const removerPagamento = async (token, id) => {
  return await request(app)
    .delete(`/payments/${id}`)
    .set("Authorization", `Bearer ${token}`);
};

module.exports = { criarPagamento, atualizarStatusPagamento, removerPagamento };
