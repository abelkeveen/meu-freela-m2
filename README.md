# Meu Freela API

API REST para gerenciamento rápido de freelas, clientes e pagamentos de um profissional autônomo.

## Objetivo

Organizar a rotina de freelancers, permitindo registrar clientes, projetos (jobs) e pagamentos.

## Funcionalidades

- Autenticação JWT
- Cadastro e listagem de clientes
- Cadastro e listagem de jobs (freelas/diárias)
- Registro e resumo de pagamentos
- Documentação Swagger acessível via `/swagger`

## Estrutura do Projeto

- `src/routes` — Rotas da API
- `src/controllers` — Lógica dos endpoints
- `src/services` — Regras de negócio
- `src/models` — Banco de dados em memória
- `src/middleware` — Middleware de autenticação
- `recursos` — Documentação Swagger

## Endpoints Principais

### Autenticação

- `POST /auth/register` — Cria usuário (login, senha)
- `POST /auth/login` — Gera token JWT

### Clientes (protegido)

- `GET /clients` — Lista todos os clientes
- `POST /clients` — Cadastra novo cliente
- `GET /clients/{id}` — Dados de um cliente
- `PUT /clients/{id}` — Atualiza cliente
- `DELETE /clients/{id}` — Remove cliente

### Jobs (protegido)

- `GET /jobs` — Lista todos os jobs
- `POST /jobs` — Cria novo job
- `GET /jobs/{id}` — Detalhes de um job
- `PUT /jobs/{id}` — Atualiza job
- `DELETE /jobs/{id}` — Remove job

### Pagamentos (protegido)

- `GET /payments` — Lista pagamentos
- `POST /payments` — Registra pagamento
- `GET /payments/summary` — Resumo financeiro

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie a API:
   ```bash
   node server.js
   ```

## Testes automatizados

Os testes de API usam Mocha, Chai e Supertest. Antes de cada teste, o banco em memória é zerado (`test/setup.js`), então os testes são independentes entre si.

```bash
npm test
```

Cobertura atual: 55 testes, organizados por recurso em `test/`:

| Pasta | O que cobre |
|---|---|
| `autenticacao` | registro e login |
| `cliente` | CRUD, nome único, ID imutável, exclusão com vínculos |
| `job` | CRUD, cliente obrigatório, exclusão com pagamentos |
| `pagamento` | cadastro, status, consulta e resumo financeiro |

As regras de negócio que guiam os testes estão em [Regras_de_Negocio.md](Regras_de_Negocio.md).

## Observações

- Todos os dados são armazenados em memória (não persistem após reiniciar).
- As rotas de clientes, jobs e pagamentos exigem autenticação via JWT.
- Consulte o arquivo `recursos/swagger.json` para detalhes dos modelos e respostas da API.
