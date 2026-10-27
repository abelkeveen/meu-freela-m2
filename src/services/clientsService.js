const { clients } = require("../models/db");

module.exports = {
  list: (req, res) => res.json(clients),
  create: (req, res) => {
    const { nome, contato } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome obrigatório." });
    const existingClient = clients.find((client) => client.nome === nome);
    if (existingClient) {
      return res
        .status(409)
        .json({ error: "Nome de cliente já existente." });
    }
    const client = { id: clients.length + 1, nome, contato };
    clients.push(client);
    res.status(201).json(client);
  },
  get: (req, res) => {
    const client = clients.find((c) => c.id == req.params.id);
    if (!client)
      return res.status(404).json({ error: "Cliente não encontrado." });
    res.json(client);
  },
  update: (req, res) => {
    const client = clients.find((c) => c.id == req.params.id);
    if (!client)
      return res.status(404).json({ error: "Cliente não encontrado." });
    const { id, ...updates } = req.body;
    if (id !== undefined && Number(id) !== client.id) {
      return res
        .status(400)
        .json({ error: "O identificador do cliente não pode ser alterado." });
    }
    Object.assign(client, updates);
    res.json(client);
  },
  remove: (req, res) => {
    const idx = clients.findIndex((c) => c.id == req.params.id);
    if (idx === -1)
      return res.status(404).json({ error: "Cliente não encontrado." });
    // Verifica se há jobs vinculados ao cliente
    const { jobs } = require("../models/db");
    const hasJobs = jobs.some((j) => j.clienteId == req.params.id);
    if (hasJobs) {
      return res
        .status(409)
        .json({
          error: "Não é permitido remover cliente com jobs vinculados.",
        });
    }
    clients.splice(idx, 1);
    res.status(204).end();
  },
};
