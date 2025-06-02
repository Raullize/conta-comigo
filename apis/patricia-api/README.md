# 🏦 API - Simulação de um Mini Banco Central

## 🎯 Objetivo

Essa API REST tem como objetivo simular um banco central no contexto de Open Finance. Essa simulação deve funcionar tal qual um banco real, por isso possui diversas rotas (exemplificadas mais à frente) para ilustrar cada funcionalidade.

---

## 🛠️ Ferramentas Utilizadas

### 🧩 Backend

- **Node.js**: ambiente de execução JavaScript
- **Express**: framework web minimalista para criação de APIs
- **Sequelize**: ORM para modelagem e interação com o banco de dados

### 🔐 Autenticação e Segurança

- **bcrypt**: hash de senhas
- **jsonwebtoken (JWT)**: autenticação via token JWT

### ✅ Validação e Utilitários

- **Yup**: validação de schemas (corpo das requisições)

### 🗄️ Banco de Dados

- **PostgreSQL**: banco de dados relacional
- **pg**: cliente de conexão com PostgreSQL para Node.js
- **pg-hstore**: parser necessário para serializar objetos via Sequelize

### ⚙️ Ferramentas de Desenvolvimento

- **Nodemon**: reinicia o servidor automaticamente ao salvar alterações
- **Sequelize CLI**: utilitário para gerar e gerenciar migrations, seeds e models
- **Sucrase**: compilador para transformar código de forma rápida

### 🐳 Infraestrutura

- **Docker**: contêinerização (utilizado para o banco de dados)
- **Docker Compose**: orquestração do serviço PostgreSQL

### 📦 Gerenciador de Pacotes

- **NPM**: gerenciador de dependências e scripts do Node.js

---

## 🚀 Passo a Passo para Executar a API


1) Clone o repositório:
```bash
crie uma pasta, abra essa pasta no terminal, no terminal escreva os itens abaixo:
git clone https://github.com/patriciapqa/apiminibanco.git
cd apiminibanco
```
2) Instale as dependências:
```bash
npm install
```
3) Suba o banco de dados com o Docker:
```bash
docker-compose up -d
```

4) Execute as migrations com Sequelize CLI:
```bash
npx sequelize db:create
npx sequelize db:migrate
```

5) Inicie a API em ambiente de desenvolvimento:
```bash
npm run dev
```

6) Insomnia

Durante a criação da API, foi utilizado o aplicativo **Insomnia** para testar as requisições. Recomenda-se que ele seja utilizado para facilitar a execução e visualização dos testes.

- Link para download: [https://insomnia.rest/](https://insomnia.rest/)
- O arquivo com as requisições prontas está disponível na pasta `insomnia` do projeto.

#### Como importar as requisições no Insomnia:
1. Após instalar o Insomnia, abra o aplicativo.
2. Na tela inicial, clique em **Import**.
3. Arraste o arquivo da pasta `insomnia` para a área de importação.
4. Clique em **Scan** e as requisições estarão disponíveis para uso.

> No Insomnia:
> - Adicione os dados no **Body** para rotas do tipo `POST`, `PUT` e `DELETE`.
> - Use a aba **Auth** para inserir o token quando necessário.

---

### Conteúdo da API

**Abreviações utilizadas:**
- `(*)` Obrigatório
- `(!)` Requer token de autenticação

> ⚠️ Muitas rotas necessitam de autenticação. Siga a ordem abaixo para evitar erros.

---

#### 1) Criação de usuários
Cria novos usuários no sistema.

- **Rota:** `POST /users`
- **Requisitos:**
```json
{
  "name": "Elvis",
  "cpf": "05949021191",
  "password": "123123"
}

```
---

#### 2) Área de login
Gera o token JWT para autenticação.

- **Rota:** `POST /sessions`
- **Requisitos:**
```json
{
  "cpf": "05949021190",
  "password": "123123"
}

```
---

#### 3) Criação de instituições
Cadastra uma nova instituição bancária.
obs: se for um nome composto deve ser escrito junto. ex: bancodobrasil

- **Rota:** `POST /instituicao`
- **Requisitos:**
```json
{
  "nome": "banrisul"
}
```

##### 3.1) Apagar uma instituição
- **Rota:** `DELETE /instituicao`
- **Requisitos:**
```json
{
  "id": 7
}
```

---

#### 4) Atualização de usuário (!)
Permite atualizar nome ou senha.

- **Rota:** `PUT /users`
- **Exemplo completo:**
```json
{
  "name": "Elvis",
  "oldPassword": "123123",
  "password": "123456",
  "confirmPassword": "123456"
}
```

---

#### 5) Criação de conta (!)
- **Rota:** `POST /conta`
- **Requisitos:**
```json
{
  "numero": "444145",
  "instituicao_id": 5
}
```

---

#### 6) Listar contas do usuário (!)
- **Rota:** `POST /contas`
- **Requisitos:**
```json
{
  "usuario_id": 2
}
```

---

#### 7) Realizar transação (!)
Tipos: `credito`, `debito`, `transferencia`

- **Rota:** `POST /transacao`
##### Exemplo de crédito/debito:
```json
{
  "descricao": "salario",
  "tipo": "credito",
  "valor": 1100,
  "data": "2025-04-16",
  "conta_id": 1
}
```
##### Exemplo de transferência:
```json
{
  "descricao": "salario",
  "tipo": "transferencia",
  "valor": 1100,
  "data": "2025-04-16",
  "conta_id": 1,
  "destinatario_id": 5
}
```

---

#### 8) Conferência de saldo (!)

##### 8.1) Por instituição
- **Rota:** `GET /saldo/instituicao/:nome`
- **Exemplo de URL:** `http://localhost:3333/saldo/instituicao/itau`

##### 8.2) Total
- **Rota:** `GET /saldo/total`
- **URL:** `http://localhost:3333/saldo/total`

---

#### 9) Conferência de extrato (!)

##### 9.1) Por instituição
- **Rota:** `GET /extrato/instituicao/:nome`
- **Exemplo de URL:** `http://localhost:3333/extrato/instituicao/nubank`

##### 9.2) Total
- **Rota:** `GET /extrato/total`
- **URL:** `http://localhost:3333/extrato/total`
