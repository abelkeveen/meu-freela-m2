// Teste de vazão do login: 20 logins por segundo durante 1 minuto,
// independente do tempo de resposta (modelo de chegada constante).
// Objetivo: o login usa bcrypt de forma síncrona (compareSync), o que
// ocupa o processador e pode atrasar todas as outras requisições da API.
// Este teste mede quanto o login aguenta antes de degradar.
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, criarUsuarioELogar } from './lib/api.js';

export const options = {
  scenarios: {
    login_constante: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    'http_req_duration{name:POST /auth/login}': ['p(95)<300'],
    dropped_iterations: ['count<10'], // logins que nem chegaram a ser enviados
  },
};

export function setup() {
  return criarUsuarioELogar();
}

export default function ({ credenciais }) {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify(credenciais), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /auth/login' },
  });
  check(res, {
    'login ok (200)': (r) => r.status === 200,
    'token recebido': (r) => typeof r.json('token') === 'string',
  });
}
