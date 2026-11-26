// Teste de carga: sobe até 20 usuários virtuais simultâneos executando o
// fluxo completo (cliente -> job -> pagamento -> consultas).
// Objetivo: verificar se a API mantém tempo de resposta e taxa de erro
// aceitáveis com uso concorrente realista para um sistema pequeno.
import { sleep } from 'k6';
import { criarUsuarioELogar, fluxoFreelancer } from './lib/api.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // rampa de subida
    { duration: '1m', target: 20 }, // carga sustentada
    { duration: '15s', target: 0 }, // rampa de descida
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // menos de 1% de erro
    checks: ['rate>0.99'],
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    // As listagens devolvem todos os registros (sem paginação), então
    // são acompanhadas separadamente: tendem a piorar com o volume de dados.
    'http_req_duration{name:GET /clients}': ['p(95)<500'],
    'http_req_duration{name:GET /payments}': ['p(95)<500'],
    'http_req_duration{name:GET /payments/summary}': ['p(95)<500'],
  },
};

export function setup() {
  return criarUsuarioELogar();
}

export default function ({ token }) {
  fluxoFreelancer(token);
  sleep(1);
}
