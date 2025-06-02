# API Mini Banco Central

Esta API desenvolvida em Node.js simula um sistema bancário centralizado, permitindo:

- Criação de instituições financeiras
- Cadastro de usuários
- Gerenciamento de contas bancárias
- Operações financeiras (transferências, depósitos, saques)
- Consultas de saldo e extrato

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **Docker** - Containerização da aplicação
- **Sequelize** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional

## 📂 Estrutura do Projeto

```bash
src/
├── app/
│ ├── controllers/ # Lógica de negócios
│ ├── models/ # Modelos de dados
│ ├── config/ # Configurações
│ ├── database/ # Migrações e seeds
│ ├── routes/ # Definição de rotas
│ └── services/ # Serviços auxiliares
├── server.js # Ponto de entrada
└── app.js # Configuração principal
```

## 🚀 Como Executar

### Pré-requisitos

- Docker instalado
- Node.js (v16 ou superior)

### Passo a Passo

Clone o repositório:

```bash
git clone https://github.com/Viitorkm/MiniBancoCentral
cd MiniBancoCentral
```

Instalar o npm

```bash
npm install
```

Inicie os containers:

```bash
docker-compose up -d
```

Execute as migrações:

```bash
npx sequelize-cli db:migrate
```

(Opcional) Popule o banco com dados iniciais:

```bash
npx sequelize-cli db:seed:all
```

Inicie a aplicação:

```bash
node src/server.js
```

A API estará disponível em http://localhost:3000

# 📘 API Endpoints - Sistema Bancário

## 👤 Usuário

### Criar Usuário

- **URL**: `/newuser`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "cpf": "string",
    "name": "string"
  }
  ```
- **Resposta**: `"Usuario Criado"` ou `"O Usuario Já Existe"`

### Listar Usuários

- **URL**: `/listUsers`
- **Método**: `GET`
- **Resposta**: Lista de usuários cadastrados

---

## 🏦 Instituição

### Criar Instituição

- **URL**: `/newInstitution`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "name": "string"
  }
  ```
- **Resposta**: `"Instituição X Criada"` ou mensagem de erro

### Listar Instituições

- **URL**: `/listInstitutions`
- **Método**: `GET`
- **Resposta**: Lista de instituições

---

## 💼 Conta

### Criar Conta

- **URL**: `/users/:user_cpf/accounts`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "institution_id": number
  }
  ```
- **Resposta**: `"Conta criada"` ou `"Conta já existe"`

### Consultar Saldo

- **URL**: `/users/:user_cpf/balance`
- **Método**: `GET`
- **Query Param (opcional)**: `institution_id`
- **Resposta**: Saldo da(s) conta(s) do usuário

### Realizar Depósito

- **URL**: `/users/:user_cpf/deposit`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "value": number,
    "institution_id": number
  }
  ```
- **Resposta**: Confirmação do depósito

### Realizar Saque

- **URL**: `/users/:user_cpf/withdrawal`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "value": number,
    "institution_id": number
  }
  ```
- **Resposta**: Confirmação do saque ou erro por saldo insuficiente

### Extrato da Conta

- **URL**: `/users/:user_cpf/statement`
- **Método**: `GET`
- **Query Param (opcional)**: `institution_id`
- **Resposta**: Transações enviadas e recebidas

---

## 🔁 Transações

### Transferência entre Contas

- **URL**: `/users/:origin_cpf/transaction`
- **Método**: `POST`
- **Body**:
  ```json
  {
    "destination_cpf": "string",
    "institution_id": number,
    "value": number,
    "description": "string (opcional)"
  }
  ```
- **Resposta**: `"Transação realizada com sucesso!"` ou erro
