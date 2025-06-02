# API Agregadora de Contas Bancárias (Mini Banco Central)

Esta é uma API REST para gerenciamento de usuários, contas bancárias, transações e instituições financeiras. Abaixo estão listadas todas as rotas disponíveis, suas funcionalidades e exemplos de uso.

---

## Rotas

### **Usuários**

#### Criar usuário
 **POST** `/usuarios`

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com"
}
```

#### Atualizar usuário
**PUT** `/usuarios/:id`
##### `id = usuarioId`

**Body:**
```json
{
  "nome": "João Atualizado",
  "email": "joao_novo@email.com"
}
```

#### Deletar usuário
**DELETE** `/usuarios/:id`
##### `id = usuarioId`

#### Obter saldo total do usuário
**GET** `/usuarios/:id/saldo`
#### Obter saldo total do usuário em uma instituição financeira específica
**GET** `/usuarios/:id/saldo?instituicaoId= <ID_intituição>`
##### `id = usuarioId`

#### Obter extrato do usuário
**GET** `/usuarios/:id/extrato`
#### Obter extrato total do usuário em uma instituição financeira específica
**GET** `/usuarios/:id/extrato?instituicaoId= <ID_intituição>`
##### `id = usuarioId`

---

### Contas

#### Criar conta para um usuário
**POST** `/usuarios/:id/contas`
##### `id = ID do Usuário`
**Body:**
```json
{
  "instituicaoId": 1,
  "saldo": 1000.00
}
```

#### Atualiza saldo da conta
**PUT** `/contas/:id`
##### `id = ID da Conta`
**Body:**
```json
{
  "saldo": 1200.00,
}
```

#### Deletar conta
**DELETE** `/contas/:id`
##### `id = ID da Conta`
---

### Transações

#### Criar transação para um usuário
**POST** `/usuarios/:id/transacoes`
##### `id = ID do Usuário`
**Body:**
```json
{
  "contaId": 2,
  "tipo": "credito",
  "valor": 500,
  "descricao": "Depósito"
}
```

#### Deletar transação
**DELETE** `/transacoes/:id`

---

### Instituições

#### Criar instituição
**POST** `/instituicoes`

**Body:**
```json
{
  "nome": "Banco XP"
}
```

#### Atualizar instituição
**PUT** `/instituicoes/:id`
##### `id = Id da instuição`
**Body:**
```json
{
  "nome": "Banco XP Atualizado"
}
```

#### Deletar instituição
**DELETE** `/instituicoes/:id`
##### `id = Id da instuição`
---

### Rota de Teste

#### Criar usuário de teste
**GET** `/teste`

Retorna um usuário de teste criado para fins de validação.

---
## 📁 Estrutura do Projeto

```
.
├── bd/
│   ├── controllers/
│   ├── models/
│   ├── migrations/
│   └── config.js
├── .env
├── index.js
├── rotas.js
├── docker-compose.yaml
└── README.md
```

---

## 🚀 Como Rodar o Projeto

### 1. **Clone o repositório**

```bash
git clone https://github.com/Dante-Alsino/Api-Mini-Banco-Central.git
```

---

### 2. **Configure o arquivo `.env`**

No arquivo `.env` na raiz, está toda as informaçoes para criação para banco de dados, caso deseje alterar alguma coisa é nele que deve mudar, atualmente está assim:

```
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=api_rest
PG_PASSWORD=admin
PG_PORT=5432
```

Essas variáveis serão usadas pelo Sequelize para se conectar ao banco PostgreSQL.

---

### 3. **Suba o container do banco com Docker**

Garanta que o Docker esteja instalado, depois rode:

```bash
docker-compose up -d
```

Isso irá:

- Criar um container com PostgreSQL
- Usar o volume `./dados_postgres` para persistir os dados
- Escutar na porta `5432`

---

### 4. **Instale as dependências do projeto**

```bash
npm install
```

---

### 5. **Configure o Sequelize**
Para criar o banco de dados com Sequelize CLI use o comando:
```bash
npx sequelize-cli db:create
```

para fazer as migrations, rode:

```bash
npx sequelize-cli db:migrate
```

Se não estiver usando CLI, certifique-se de que as migrations estão sendo executadas no seu `index.js` ou na inicialização.

---

### 6. **Inicie a API**

```bash
npm start
```

A API ficará acessível em:  
📍 `http://localhost:3000`

---
## 📦 Tecnologias e Bibliotecas Usadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [pg](https://www.npmjs.com/package/pg)
- [pg-hstore](https://www.npmjs.com/package/pg-hstore)
- [Jest](https://jestjs.io/) e [Supertest](https://www.npmjs.com/package/supertest) — para testes automatizados

---
## ⚙️Teste
Para testar a API, você pode usar ferramentas como Postman ou cURL.
ou pode usar o arquivo usando Jest e Supertest.

use o comando: `npm test` no terminal do projeto



