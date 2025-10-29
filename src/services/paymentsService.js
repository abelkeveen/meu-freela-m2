const { payments, jobs } = require("../models/db");

module.exports = {
  list: (req, res) => res.json(payments),
  create: (req, res) => {
    const { jobId, valor, recebido, data } = req.body;
    if (!jobId || !valor)
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: jobId, valor." });
    const payment = {
      id: payments.length + 1,
      jobId,
      valor,
      recebido: !!recebido,
      data: data || new Date().toISOString().slice(0, 10),
    };
    payments.push(payment);
    res.status(201).json(payment);
  },
  summary: (req, res) => {
    const totalRecebido = payments
      .filter((p) => p.recebido)
      .reduce((acc, p) => acc + p.valor, 0);
    const totalPendente = payments
      .filter((p) => !p.recebido)
      .reduce((acc, p) => acc + p.valor, 0);
    res.json({ totalRecebido, totalPendente });
  },
};
