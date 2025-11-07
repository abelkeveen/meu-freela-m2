const { jobs, payments } = require("../models/db");

module.exports = {
  list: (req, res) => res.json(jobs),
  create: (req, res) => {
    const { clienteId, descricao, valor, status, data } = req.body;
    if (!clienteId || !descricao || !valor || !data)
      return res.status(400).json({
        error: "Campos obrigatórios: clienteId, descricao, valor, data.",
      });
    const job = {
      id: jobs.length + 1,
      clienteId,
      descricao,
      valor,
      status: status || "pendente",
      data,
    };
    jobs.push(job);
    res.status(201).json(job);
  },
  get: (req, res) => {
    const job = jobs.find((j) => j.id == req.params.id);
    if (!job) return res.status(404).json({ error: "Job não encontrado." });
    res.json(job);
  },
  update: (req, res) => {
    const job = jobs.find((j) => j.id == req.params.id);
    if (!job) return res.status(404).json({ error: "Job não encontrado." });
    Object.assign(job, req.body);
    res.json(job);
  },
  remove: (req, res) => {
    const idx = jobs.findIndex((j) => j.id == req.params.id);
    if (idx === -1)
      return res.status(404).json({ error: "Job não encontrado." });
    const jobId = Number(req.params.id);
    const pagamentosVinculados = payments.some((p) => p.jobId === jobId);
    if (pagamentosVinculados) {
      return res
        .status(409)
        .json({
          error: "Não é possível remover o job: existem pagamentos vinculados.",
        });
    }
    jobs.splice(idx, 1);
    res.status(204).end();
  },
};
