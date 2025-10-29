const { payments, jobs } = require("../models/db");

module.exports = {
  list: (req, res) => {
    const { jobs } = require("../models/db");
    const { clients } = require("../models/db");
    const pagamentosComCliente = payments.map((p) => {
      const job = jobs.find((j) => j.id === p.jobId);
      let clienteNome = null;
      if (job) {
        const cliente = clients.find((c) => c.id === job.clienteId);
        if (cliente) clienteNome = cliente.nome;
      }
      return { ...p, clienteNome };
    });
    res.json(pagamentosComCliente);
  },
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
  updateStatus: (req, res) => {
    const id = parseInt(req.params.id);
    const { recebido } = req.body;
    const payment = payments.find((p) => p.id === id);
    if (!payment) {
      return res.status(404).json({ error: "Pagamento não encontrado." });
    }
    if (typeof recebido !== "boolean") {
      return res
        .status(400)
        .json({ error: "Campo 'recebido' deve ser booleano." });
    }
    payment.recebido = recebido;
    res.json(payment);
  },
};
