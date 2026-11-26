const { jobs, payments, clients, nextId } = require("../models/db");

module.exports = {
  list: (req, res) => res.json(jobs),
  create: (req, res) => {
    const { clienteId, descricao, valor, status, data } = req.body;
    if (!clienteId || !descricao || !valor || !data)
      return res.status(400).json({
        error: "Campos obrigatórios: clienteId, descricao, valor, data.",
      });
    if (!clients.some((c) => c.id == clienteId))
      return res.status(404).json({ error: "Cliente não encontrado." });
    const job = {
      id: nextId("jobs"),
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
    const { id, ...updates } = req.body;
    if (id !== undefined && Number(id) !== job.id)
      return res
        .status(400)
        .json({ error: "O identificador do job não pode ser alterado." });
    if (
      updates.clienteId !== undefined &&
      !clients.some((c) => c.id == updates.clienteId)
    )
      return res.status(404).json({ error: "Cliente não encontrado." });
    Object.assign(job, updates);
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
