const PaymentsService = require("../services/paymentsService");

module.exports = {
  list: (req, res) => PaymentsService.list(req, res),
  create: (req, res) => PaymentsService.create(req, res),
  summary: (req, res) => PaymentsService.summary(req, res),
  updateStatus: (req, res) => PaymentsService.updateStatus(req, res),
};
