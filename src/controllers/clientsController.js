const ClientsService = require("../services/clientsService");

module.exports = {
  list: (req, res) => ClientsService.list(req, res),
  create: (req, res) => ClientsService.create(req, res),
  get: (req, res) => ClientsService.get(req, res),
  update: (req, res) => ClientsService.update(req, res),
  remove: (req, res) => ClientsService.remove(req, res),
};
