const {
  clients,
  jobs,
  payments,
  users,
  resetIds,
} = require("../src/models/db");

exports.mochaHooks = {
  beforeEach() {
    clients.length = 0;
    jobs.length = 0;
    payments.length = 0;
    users.length = 0;
    resetIds();
  },
};
