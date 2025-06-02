# API Open Finance - Banco Central Simulado

## Índice

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Entidades Principais](#entidades-principais)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#️-pré-requisitos)
- [Instalação](#instalação)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Teste com Insomnia](#testando-os-endpoints-no-insomnia)
- [Contribuição](#contribuição)
- [Desenvolvedor](#desenvolvedor)


## Descrição
Essa é uma API RESTful que simula o papel de um "Banco Central" no contexto de Open Finance. O objetivo é consolidar informações bancárias de usuários, permitindo o acesso a saldos e extratos de diferentes instituições financeiras.

## Funcionalidades
- Cadastro de Instituições Financeiras
- Cadastro de Contas para Usuários
- Lançamento de Transações (Crédito/Débito)
- Visualização de Saldo Total Consolidado
- Visualização de Extratos por Instituição ou Geral

## Entidades Principais
- **Usuário**: pode ter contas em diversas instituições
- **Instituição**: representa um banco (ex: Santander)
- **Conta**: associa um usuário a uma instituição e possui um saldo
- **Transação**: representa uma movimentação financeira em uma conta

## Estrutura do Projeto
```
C:.\openFinanceAPI
├───config
│    └───config.js
├───migrations
│    ├───20250408121138-create-usuario.js
│    ├───20250408121224-create-instituicao.js
│    ├───20250408121314-create-conta.js
│    └───20250408121328-create-transacao.js
├───models
│    ├───conta.js
│    ├───index.js
│    ├───instituicao.js
│    ├───transacao.js
│    └───usuario.js
├───node_modules
│    └─── ...
├───seeders
├───src
│    ├───controllers
│    │    ├───contaController.js
│    │    ├───instituicaoController.js
│    │    ├───transacaoController.js
│    │    └───usuarioController.js
│    ├───database
│    ├───routes
│    │    ├───contaRoutes.js
│    │    ├───instituicaoRoutes.js
│    │    ├───transacaoRoutes.js
│    │    └───usuarioRoutes.js
│    └───utils
│         └───geradorCpf.js
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

 Obs: O diretório seeders/ está vazio, mas pode ser usado futuramente para povoar o banco com dados iniciais.

## Tecnologias Utilizadas
- Node.js
- Express
- Sequelize (ORM)
- PostgreSQL (Banco de dados relacional)
- Dotenv
- cpf-cnpj-validator (validação de CPF)

## ⚠️ Pré-requisitos
- Node.js instalado
- PostgreSQL instalado e rodando
- Ferramenta de requisição HTTP como Insomnia ou Postman

## Instalação

## Rodando localmente (sem Docker)

### 1. Clone o repositório
```bash
git clone git@github.com:l-guidotti/desafiosCompass.git
cd desafiosCompass
cd openFinanceAPI
```

### 2. Instale as dependências
```bash
npm install
```
** Isso inclui a biblioteca `cpf-cnpj-validator`, usada para validar CPFs

### 3. Abra o projeto na sua IDE:
```bash
code .
```

### 4. Configure o arquivo `.env` na raiz do projeto:

```.env
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=nome_do_banco
DB_HOST=localhost
DB_DIALECT=postgres
```

### 5. Configure o banco de dados
Edite o arquivo `config/config.js` com as informações do .env:

```js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
};
```

### 6. Crie o banco de dados e execute as migrations
```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

### 7. Inicie o servidor:
```bash
node .\server.js
```

## Endpoints Disponíveis
### **/usuarios**

| Método | Rota                               | Ação                                     |
|--------|------------------------------------|-------------------------------------------|             
| POST | `/usuarios` | Cadastrar novo usuário |
| GET | `/usuarios` | Lista todos os usuários cadastrados |
| GET | `/usuarios/:cpf` | Lista o usuário por CPF |
| PUT | `/usuarios/:cpf` | Edita dados do usuário pelo CPF |
| DELETE | `/usuarios/:cpf` | Deleta um usuário pelo CPF |
| GET | `/usuarios/:cpf/extrato` | Gera extrato de transferências em todas as instituições |
| GET | `/usuarios/:cpf/extrato?instituicao=banco%20santander` | Gera extrato de transferências na instituição especificada |

### **/instituicoes**

| Método | Rota                               | Ação                                     |
|--------|------------------------------------|-------------------------------------------|
| POST   | `/instituicoes`                   | Cadastrar nova instituição  |

### **/contas**

| Método | Rota                               | Ação                                     |
|--------|------------------------------------|-------------------------------------------|             
| POST | `/:cpf/contas` | Criar nova conta |
| GET | `/contas` | Lista todas as contas |
| GET | `/contas/:id` | Lista conta pelo id da conta |
| DELETE | `/contas/:id` | Deleta conta pelo id da conta |

### **/transacoes**

| Método | Rota                               | Ação                                     |
|--------|------------------------------------|-------------------------------------------|             
| POST | `/usuarios/:cpf/transacoes` | Criar nova transação |
| GET | `/usuarios/:cpf/saldo` | Mostra o saldo acumulado das instituições de cada usuário |
| GET | `/usuarios/:cpf/saldo?instituicao=banco%20santander` | Mostra o  saldo total do usuário naquela instituição |

---

## Testando os endpoints no insomnia

### 1. Crie uma nova requisição
- Abra o Insomnia
- Clique em "+"
- Clique em "New Request" ou "Nova Requisição"
- Dê um nome (ex: Cadastrar Usuário)
- Selecione o método HTTP (ex: POST)
- Insira a URL (ex: http://localhost:3001/usuarios)

### 2. Configure o corpo da requisição
- Clique na aba Body
- Selecione a opção JSON
- Insira o JSON com os dados necessários. Exemplo para cadastrar um usuário:
```json
{
  "cpf": "13677750512",
  "nome": "Lucas Guidotti",
  "email": "lucas@email.com"
}
```
⚠️ Para realizar requisição de cadastro de usuários, é obrigatório utilizar um CPF válido.⚠️

Você pode gerar um CPF válido para testes de duas formas:
- Usando o Gerador de CPF da 4Devs: https://www.4devs.com.br/gerador_de_cpf
- Ou usando o script interno `geradorCpf.js` localizado em `src/utils/geradorCpf.js`, executando ele assim:
```bash
node src/utils/geradorCpf.js
```

### 3. Envie a requisição
- Clique em Send
- Verifique a resposta na aba de resposta do Insomnia

### 4. Faça o mesmo para os demais endpoints
Aqui vão alguns exemplos úteis:

- Criar uma instituição
POST http://localhost:3001/instituicoes
```json
{
  "nome": "Banco Inter"
}
```

- Criar uma conta
POST http://localhost:3001/12345678901/contas
```json
{
	"saldo": "1000",
	"instituicaoId": 2
}
```

- Criar uma transação
POST http://localhost:3000/usuarios/12345678901/transacoes
```json
{
	"tipo": "entrada",
	"valor": "500.50",
	"contaId": 1
}
```
---

## Contribuição
Sinta-se à vontade para enviar PRs ou abrir issues com sugestões de melhorias. Vamos construir algo massa juntos!

---

## Desenvolvedor
**Lucas Guidotti**
