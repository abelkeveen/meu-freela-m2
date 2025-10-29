const JobsService = require("../services/jobsService");

module.exports = {
  list: (req, res) => JobsService.list(req, res),
  create: (req, res) => JobsService.create(req, res),
  get: (req, res) => JobsService.get(req, res),
  update: (req, res) => JobsService.update(req, res),
  remove: (req, res) => JobsService.remove(req, res),
};
