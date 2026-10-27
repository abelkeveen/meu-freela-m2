const { clients, jobs, payments, users } = require("../src/models/db");

exports.mochaHooks = {
  beforeEach() {
    clients.length = 0;
    jobs.length = 0;
    payments.length = 0;
    users.length = 0;
  },
};
