// Funções compartilhadas pelos testes de performance (k6).
import http from 'k6/http';
import { check, fail } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function authHeaders(token) {
  return { headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` } };
}

// Texto único por VU e iteração (o nome do cliente precisa ser único na API)
export function unico(prefixo) {
  return `${prefixo}-${__VU}-${__ITER}-${Date.now()}`;
}

// Cria um usuário e devolve o token. Usado no setup() de cada teste.
export function criarUsuarioELogar() {
  const credenciais = { login: `perf_${Date.now()}`, senha: 'senha123' };

  const registro = http.post(`${BASE_URL}/auth/register`, JSON.stringify(credenciais), {
    headers: JSON_HEADERS,
    tags: { name: 'POST /auth/register' },
  });
  if (registro.status !== 201) fail(`registro falhou: ${registro.status} ${registro.body}`);

  const login = http.post(`${BASE_URL}/auth/login`, JSON.stringify(credenciais), {
    headers: JSON_HEADERS,
    tags: { name: 'POST /auth/login' },
  });
  if (login.status !== 200) fail(`login falhou: ${login.status} ${login.body}`);

  return { token: login.json('token'), credenciais };
}

// Fluxo principal do freelancer: cadastra cliente, job e pagamento,
// consulta as listas e o resumo financeiro. Cada requisição tem uma tag
// "name" para as métricas saírem separadas por endpoint.
export function fluxoFreelancer(token) {
  const params = (name) => ({ ...authHeaders(token), tags: { name } });

  const cliente = http.post(
    `${BASE_URL}/clients`,
    JSON.stringify({ nome: unico('Cliente'), contato: 'perf@teste.com' }),
    params('POST /clients')
  );
  check(cliente, { 'cliente criado (201)': (r) => r.status === 201 });
  if (cliente.status !== 201) return;
  const clienteId = cliente.json('id');

  const job = http.post(
    `${BASE_URL}/jobs`,
    JSON.stringify({ clienteId, descricao: unico('Job'), valor: 1000, status: 'pendente', data: '2026-12-01' }),
    params('POST /jobs')
  );
  check(job, { 'job criado (201)': (r) => r.status === 201 });
  if (job.status !== 201) return;
  const jobId = job.json('id');

  const pagamento = http.post(
    `${BASE_URL}/payments`,
    JSON.stringify({ jobId, valor: 250, recebido: false, data: '2026-12-02' }),
    params('POST /payments')
  );
  check(pagamento, { 'pagamento registrado (201)': (r) => r.status === 201 });

  const detalhe = http.get(`${BASE_URL}/clients/${clienteId}`, params('GET /clients/:id'));
  check(detalhe, { 'cliente consultado (200)': (r) => r.status === 200 });

  const clientes = http.get(`${BASE_URL}/clients`, params('GET /clients'));
  check(clientes, { 'clientes listados (200)': (r) => r.status === 200 });

  const jobs = http.get(`${BASE_URL}/jobs`, params('GET /jobs'));
  check(jobs, { 'jobs listados (200)': (r) => r.status === 200 });

  const pagamentos = http.get(`${BASE_URL}/payments`, params('GET /payments'));
  check(pagamentos, { 'pagamentos listados (200)': (r) => r.status === 200 });

  const resumo = http.get(`${BASE_URL}/payments/summary`, params('GET /payments/summary'));
  check(resumo, {
    'resumo consultado (200)': (r) => r.status === 200,
    'resumo tem totais': (r) => r.json('totalRecebido') !== undefined && r.json('totalPendente') !== undefined,
  });
}
