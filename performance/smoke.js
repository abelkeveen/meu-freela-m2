// Smoke test: 1 usuário virtual por 30s.
// Objetivo: garantir que o fluxo completo funciona sob carga mínima e
// servir de linha de base de tempo de resposta. Roda em todo PR no CI.
import { sleep } from 'k6';
import { criarUsuarioELogar, fluxoFreelancer } from './lib/api.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate==0'], // nenhuma requisição pode falhar
    checks: ['rate==1'], // todas as validações precisam passar
    http_req_duration: ['p(95)<200'], // 95% das respostas em até 200 ms
  },
};

export function setup() {
  return criarUsuarioELogar();
}

export default function ({ token }) {
  fluxoFreelancer(token);
  sleep(1);
}
