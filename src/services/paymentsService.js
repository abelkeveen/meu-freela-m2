const { payments, jobs, clients, nextId } = require("../models/db");

const encontrarJob = (jobId) => jobs.find((j) => j.id == jobId);

const encontrarCliente = (job) =>
  job ? clients.find((c) => c.id == job.clienteId) : undefined;

// Pagamento válido: vinculado a um job existente cujo cliente também existe.
const pagamentoValido = (p) => Boolean(encontrarCliente(encontrarJob(p.jobId)));

module.exports = {
  list: (req, res) => {
    const pagamentosComCliente = payments.map((p) => {
      const cliente = encontrarCliente(encontrarJob(p.jobId));
      return { ...p, clienteNome: cliente ? cliente.nome : null };
    });
    res.json(pagamentosComCliente);
  },
  create: (req, res) => {
    const { jobId, valor, recebido, data } = req.body;
    if (!jobId || !valor || recebido === undefined || !data)
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: jobId, valor, recebido, data." });
    if (typeof recebido !== "boolean")
      return res
        .status(400)
        .json({ error: "Campo 'recebido' deve ser booleano." });
    if (!encontrarJob(jobId))
      return res.status(404).json({ error: "Job não encontrado." });
    const payment = {
      id: nextId("payments"),
      jobId,
      valor,
      recebido,
      data,
    };
    payments.push(payment);
    res.status(201).json(payment);
  },
  summary: (req, res) => {
    const validos = payments.filter(pagamentoValido);
    const totalRecebido = validos
      .filter((p) => p.recebido)
      .reduce((acc, p) => acc + p.valor, 0);
    const totalPendente = validos
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
