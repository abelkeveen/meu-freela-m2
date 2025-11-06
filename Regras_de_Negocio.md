# 📋 Documentação das Regras de Negócio

Aqui você encontrará todas as informações relacionadas às **regras de negócio**, **épicos**, **user stories** e **critérios de aceite** que definem o funcionamento do sistema.

## ✳️ Épicos

### 1. Gestão de Usuários

- 👤 Cadastro e autenticação de usuários (prestador)
- 🔒 Permissões de acesso por tipo de usuário

### 2. Gestão de Clientes

- 📝 Cadastro de clientes
- 🔍 Consulta, edição e remoção de clientes

### 3. Gestão de Jobs (Projetos/Serviços)

- ➕ Cadastro de jobs vinculados a clientes
- 🔍 Consulta, edição e remoção de jobs

### 4. Gestão de Pagamentos

- 💸 Registro de pagamentos recebidos ou pendentes
- 🔄 Atualização de status de pagamentos
- 📊 Resumo financeiro

---

## 📝 User Stories & Critérios de Aceite

### Gestão de Clientes

- **US01:** Como freelancer, quero cadastrar clientes para organizar meus contatos.
  - Critérios de Aceite:
    - Deve ser possível informar nome e contato.
    - O sistema deve validar que o nome é obrigatório.
    - O cliente deve aparecer na listagem após cadastro.
- **US02:** Como freelancer, quero visualizar todos os clientes cadastrados.
  - Critérios de Aceite:
    - A listagem deve mostrar nome e contato.
    - Deve ser possível buscar clientes pelo nome.
- **US03:** Como freelancer, quero editar dados de um cliente.
  - Critérios de Aceite:
    - Deve ser possível alterar nome e contato.
    - O sistema deve validar que o nome não pode ser removido.
- **US04:** Como freelancer, quero remover clientes que não trabalho mais.
  - Critérios de Aceite:
    - O cliente removido não deve aparecer na listagem.
    - Não deve ser possível remover clientes vinculados a jobs ou pagamentos.

### Gestão de Jobs

- **US05:** Como freelancer, quero cadastrar jobs vinculados a clientes.
  - Critérios de Aceite:
    - Deve ser possível informar cliente, descrição, valor, data e status.
    - O sistema deve validar que todos os campos obrigatórios foram preenchidos.
- **US06:** Como freelancer, quero visualizar todos os jobs cadastrados.
  - Critérios de Aceite:
    - A listagem deve mostrar cliente, descrição, valor, data e status.
- **US07:** Como freelancer, quero editar dados de um job.
  - Critérios de Aceite:
    - Deve ser possível alterar qualquer campo do job.
    - O sistema deve validar que o cliente vinculado existe.
- **US08:** Como freelancer, quero remover jobs que não são mais relevantes.
  - Critérios de Aceite:
    - O job removido não deve aparecer na listagem.
    - Não deve ser possível remover jobs vinculados a pagamentos.

### Gestão de Pagamentos

- **US09:** Como freelancer, quero registrar pagamentos recebidos de jobs.
  - Critérios de Aceite:
    - Deve ser possível informar job, valor, status (recebido/pendente) e data.
    - O sistema deve validar que o job existe.
- **US10:** Como freelancer, quero visualizar todos os pagamentos realizados.
  - Critérios de Aceite:
    - A listagem deve mostrar valor, status, data, job e nome do cliente.
- **US11:** Como freelancer, quero atualizar o status de um pagamento (de pendente para recebido e vice-versa).
  - Critérios de Aceite:
    - Deve ser possível alterar o status do pagamento.
    - O sistema deve validar que o pagamento existe.
    - O status deve ser refletido na listagem e no resumo financeiro.
- **US12:** Como freelancer, quero visualizar um resumo financeiro dos pagamentos recebidos e pendentes.
  - Critérios de Aceite:
    - O resumo deve mostrar o total recebido e o total pendente.
    - O cálculo deve considerar apenas pagamentos válidos.

### Autenticação e Segurança

- **US13:** Como usuário, quero me registrar e fazer login para acessar o sistema.
  - Critérios de Aceite:
    - O sistema deve validar login e senha.
    - O acesso às rotas protegidas deve exigir autenticação via JWT.

---

# ⚖️ Regras de Negócio — Meu Freela

## 1. Usuários e Autenticação

- Todo usuário deve se autenticar para acessar funcionalidades protegidas.
- O login é único e obrigatório para cada usuário.
- Senha deve ser armazenada de forma segura (hash).
- Apenas usuários autenticados podem cadastrar, editar ou remover clientes, jobs e pagamentos.

## 2. Clientes

- O nome do cliente é obrigatório e deve ser único.
- Não é permitido remover clientes que possuam jobs ou pagamentos vinculados.
- Dados do cliente podem ser atualizados, exceto o identificador único (id).

## 3. Jobs (Projetos/Serviços)

- Todo job deve estar vinculado a um cliente existente.
- Campos obrigatórios: cliente, descrição, valor, data.
- Não é permitido remover jobs que possuam pagamentos vinculados.
- O status do job pode ser alterado (ex: pendente, concluído).

## 4. Pagamentos

- Todo pagamento deve estar vinculado a um job existente.
- Campos obrigatórios: job, valor, status (recebido/pendente), data.
- O status do pagamento pode ser atualizado de pendente para recebido e vice-versa.
- Não é permitido remover pagamentos já marcados como recebido.
- O nome do cliente deve ser exibido junto ao pagamento.

## 5. Resumo Financeiro

- O sistema deve calcular o total recebido e o total pendente com base nos pagamentos cadastrados.
- Apenas pagamentos válidos (vinculados a jobs e clientes existentes) entram no cálculo.

## 6. Segurança

- Todas as rotas de clientes, jobs e pagamentos exigem autenticação via JWT.
- Dados sensíveis não devem ser expostos em respostas da API.

---

> _Esta documentação pode ser expandida conforme novas funcionalidades forem implementadas._
