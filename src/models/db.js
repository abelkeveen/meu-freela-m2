// Banco de dados em memória
const counters = { users: 0, clients: 0, jobs: 0, payments: 0 };

// Gera o próximo id da coleção. Usa um contador que só cresce,
// para que ids de registros removidos nunca sejam reutilizados.
const nextId = (collection) => {
  counters[collection] += 1;
  return counters[collection];
};

const resetIds = () => {
  Object.keys(counters).forEach((key) => {
    counters[key] = 0;
  });
};

module.exports = {
  users: [],
  clients: [],
  jobs: [],
  payments: [],
  nextId,
  resetIds,
};
