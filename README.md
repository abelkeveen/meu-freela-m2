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
   npm install express body-parser jsonwebtoken bcryptjs swagger-ui-express
   ```
2. Inicie o servidor:
   ```bash
   node server.js
   ```
3. Acesse a documentação Swagger em [http://localhost:3000/swagger](http://localhost:3000/swagger)

## Observações

- Todos os dados são armazenados em memória (não persistem após reiniciar).
- As rotas de clientes, jobs e pagamentos exigem autenticação via JWT.
- Consulte o arquivo `recursos/swagger.json` para detalhes dos modelos e respostas da API.
