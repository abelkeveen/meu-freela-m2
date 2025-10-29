const { clients } = require("../models/db");

module.exports = {
  list: (req, res) => res.json(clients),
  create: (req, res) => {
    const { nome, contato } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome obrigatório." });
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
    Object.assign(client, req.body);
    res.json(client);
  },
  remove: (req, res) => {
    const idx = clients.findIndex((c) => c.id == req.params.id);
    if (idx === -1)
      return res.status(404).json({ error: "Cliente não encontrado." });
    clients.splice(idx, 1);
    res.status(204).end();
  },
};
