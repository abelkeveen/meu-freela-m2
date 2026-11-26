# Meu Freela API: testes de API e de performance

[![Testes](https://github.com/abelkeveen/meu-freela-m2/actions/workflows/tests.yml/badge.svg)](https://github.com/abelkeveen/meu-freela-m2/actions/workflows/tests.yml)
[![Performance (k6)](https://github.com/abelkeveen/meu-freela-m2/actions/workflows/performance.yml/badge.svg)](https://github.com/abelkeveen/meu-freela-m2/actions/workflows/performance.yml)
![Mocha](https://img.shields.io/badge/Mocha-Chai%20%2B%20Supertest-8D6748?logo=mocha)
![k6](https://img.shields.io/badge/k6-performance-7D64FF?logo=k6)

API REST do **Meu Freela**, um sistema para freelancers organizarem clientes, jobs (trabalhos) e pagamentos, e as suítes de **testes de API** e de **performance** que a validam.

Este repositório faz parte de um projeto de portfólio de QA em duas partes:

| Repositório | Conteúdo | Testes |
|---|---|---|
| **meu-freela-m2** (este) | API REST (Node.js, Express, JWT e Swagger) | 67 testes de API (Mocha, Chai e Supertest) e 3 testes de performance (k6) |
| [meu-freela-m2-web](https://github.com/abelkeveen/meu-freela-m2-web) | Aplicação web que consome esta API | 23 testes E2E (Cypress) |

## O que este projeto demonstra

- **Testes guiados por requisitos.** As regras de negócio, user stories e critérios de aceite estão em [Regras_de_Negocio.md](Regras_de_Negocio.md), e os testes seguem essas regras, incluindo cenários negativos e de limite.
- **Testes de API independentes.** O banco em memória é zerado antes de cada teste ([test/setup.js](test/setup.js)), e os dados vêm de fixtures e helpers reutilizáveis.
- **Testes de performance com k6.** Smoke, carga e vazão do login, com thresholds (critérios de aprovação) por endpoint.
- **Integração contínua.** Testes de API e performance rodam no GitHub Actions a cada PR, com relatórios (mochawesome e dashboard do k6) salvos como artefato.
- **Bugs reportados com passos para reproduzir**, resultado esperado e obtido, e corrigidos por pull request. Veja [Bugs encontrados](#bugs-encontrados).

## Estratégia de testes

| Nível | Ferramenta | Onde | O que valida |
|---|---|---|---|
| API (funcional) | Mocha, Chai e Supertest | `test/` (este repositório) | contratos, códigos HTTP, regras de negócio e autenticação de cada endpoint |
| Performance | k6 | `performance/` (este repositório) | tempo de resposta e taxa de erro sob carga |
| E2E (interface) | Cypress | [meu-freela-m2-web](https://github.com/abelkeveen/meu-freela-m2-web) | fluxos do usuário no navegador, de ponta a ponta |

A maior parte das regras é coberta na camada de API, que é mais rápida e estável. O E2E fica com os fluxos principais do usuário, e a performance com o comportamento sob uso simultâneo.

## Testes de API

**67 testes, cerca de 3 segundos.**

| Pasta | Testes | O que cobre |
|---|---|---|
| `autenticacao` | 7 | registro, login, senha incorreta, usuário inexistente, campos obrigatórios |
| `cliente` | 18 | CRUD, nome obrigatório e único, ID imutável, bloqueio de exclusão com jobs vinculados |
| `job` | 20 | CRUD, cliente obrigatório e existente, bloqueio de exclusão com pagamentos |
| `pagamento` | 20 | cadastro, status (`recebido`), consulta com nome do cliente, resumo financeiro só com pagamentos válidos |
| `ids` | 2 | geração sequencial de IDs |

```bash
npm install
npm test               # roda a suíte
npm run test:report    # gera o relatório HTML em mochawesome-report/
```

## Testes de performance (k6)

| Teste | Cenário | Critérios de aprovação | Resultado no CI |
|---|---|---|---|
| [`smoke.js`](performance/smoke.js) | 1 usuário por 30s, fluxo completo | 0% de erro, p95 < 200 ms | p95 = 1,3 ms, 0% de erro |
| [`carga.js`](performance/carga.js) | rampa até 20 usuários simultâneos, cerca de 2 min | < 1% de erro, p95 < 500 ms e p99 < 1 s, além de limite por listagem | 13.226 requisições, p95 = 3,1 ms, 0% de erro |
| [`login.js`](performance/login.js) | 20 logins por segundo durante 1 min | < 1% de erro, p95 < 300 ms, sem logins descartados | 1.200 logins, p95 = 18,5 ms, 0% de erro |

O fluxo completo é: cadastrar cliente → cadastrar job → registrar pagamento → consultar cliente, listas e resumo financeiro. Cada requisição tem uma tag por endpoint, então as métricas saem separadas.

**Observações da análise:**
- O **login** é cerca de 20 vezes mais lento que os outros endpoints (18 ms contra menos de 1 ms), porque usa `bcrypt.compareSync`. Por ser síncrono, cada login trava o processo do Node durante esse tempo, e um pico de logins atrasa todas as outras requisições. Trocar por `bcrypt.compare` (assíncrono) resolve.
- **`GET /payments`** é o endpoint de listagem mais lento (p95 de 4,4 ms contra 0,9 ms de `GET /clients`). Para cada pagamento, ele procura o job e o cliente nas listas, então o custo cresce com o volume de dados. As listagens também não têm paginação: no teste de carga, a API devolveu 423 MB de dados em menos de 2 minutos.

Para rodar localmente, [instale o k6](https://grafana.com/docs/k6/latest/set-up/install-k6/), suba a API e rode:

```bash
npm run perf:smoke
npm run perf:carga
npm run perf:login
```

## Integração contínua

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`tests.yml`](.github/workflows/tests.yml) | todo PR, push na `main` e manual | roda os 67 testes e publica o relatório mochawesome |
| [`performance.yml`](.github/workflows/performance.yml) | PR (os 3 testes), push na `main` (smoke) e manual (teste escolhido) | sobe a API, roda o k6 e publica o dashboard HTML e o resumo em JSON |

## Bugs encontrados

Bugs encontrados durante os testes e registrados como issues, no formato: passos para reproduzir, resultado esperado e resultado obtido.

| Issue | Bug | Severidade | Status |
|---|---|---|---|
| [#1](https://github.com/abelkeveen/meu-freela-m2/issues/1) | Cadastro de cliente com nome duplicado | média | corrigido no [PR #3](https://github.com/abelkeveen/meu-freela-m2/pull/3) |
| [#2](https://github.com/abelkeveen/meu-freela-m2/issues/2) | `PUT /clients/{id}` permite alterar o ID | média | corrigido no [PR #3](https://github.com/abelkeveen/meu-freela-m2/pull/3) |
| [#7](https://github.com/abelkeveen/meu-freela-m2/issues/7) | Usuário acessa e altera dados de outros usuários | alta | aberto |
| [#8](https://github.com/abelkeveen/meu-freela-m2/issues/8) | Resumo financeiro concatena texto (`"0100"`) quando o valor vem como string | alta | aberto |
| [#9](https://github.com/abelkeveen/meu-freela-m2/issues/9) | Jobs e pagamentos aceitam valor negativo, valor em texto, data inválida e status livre | média | aberto |
| [#10](https://github.com/abelkeveen/meu-freela-m2/issues/10) | Cliente com nome só de espaços ou editado para vazio | média | aberto |
| [#11](https://github.com/abelkeveen/meu-freela-m2/issues/11) | Não existe endpoint para remover pagamento pendente | média | aberto |
| [#12](https://github.com/abelkeveen/meu-freela-m2/issues/12) | Segredo do JWT fixo no código-fonte | média | aberto |

As regras de jobs, pagamentos, resumo financeiro e IDs foram corrigidas no [PR #4](https://github.com/abelkeveen/meu-freela-m2/pull/4).

## Sobre a API

- **Stack:** Node.js, Express 5, JWT (`jsonwebtoken`), `bcryptjs` e Swagger UI.
- **Dados:** em memória ([src/models/db.js](src/models/db.js)). Eles se perdem quando a API reinicia.
- **Documentação interativa:** `http://localhost:3000/swagger`.

```bash
npm install
node server.js    # http://localhost:3000
```

| Recurso | Endpoints | Autenticação |
|---|---|---|
| Autenticação | `POST /auth/register`, `POST /auth/login` | não |
| Clientes | `GET /clients`, `POST /clients`, `GET /clients/{id}`, `PUT /clients/{id}`, `DELETE /clients/{id}` | JWT |
| Jobs | `GET /jobs`, `POST /jobs`, `GET /jobs/{id}`, `PUT /jobs/{id}`, `DELETE /jobs/{id}` | JWT |
| Pagamentos | `GET /payments`, `POST /payments`, `PUT /payments/{id}/status`, `GET /payments/summary` | JWT |

```
├── src/
│   ├── routes/        # rotas
│   ├── controllers/   # entrada e saída dos endpoints
│   ├── services/      # regras de negócio
│   ├── models/        # banco em memória
│   └── middleware/    # autenticação JWT
├── test/              # testes de API (Mocha)
├── performance/       # testes de performance (k6)
└── recursos/          # Swagger
```
