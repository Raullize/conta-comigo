# Raul API - Guia de Uso Simplificado

## 🏗️ Estrutura da API

### Modelos:
- **Users** (Usuários)
- **Institutions** (Instituições) 
- **Accounts** (Contas)
- **Transactions** (Transações)

## 📋 Endpoints e Exemplos para Insomnia

### 1. Health Check
```http
GET http://localhost:4006/
```

### 2. Criar Instituição
```http
POST http://localhost:4006/institutions
Content-Type: application/json

{
  "name": "Santander"
}
```

### 3. Criar Usuário
```http
POST http://localhost:4006/users
Content-Type: application/json

{
  "cpf": "04557270077",
  "name": "Raul Lize"
}
```

### 4. Criar Conta
```http
POST http://localhost:4006/users/04557270077/accounts
Content-Type: application/json

{
  "balance": 1000.00,
  "institution_id": 1,
  "consent": true
}
```

### 5. Criar Transação
```http
POST http://localhost:4006/users/04557270077/transactions
Content-Type: application/json

{
  "institution_id": 1,
  "description": "Netflix",
  "type": "saida",
  "value": 10.00,
  "account_id": 1
}
```

### 6. Listar Usuários
```http
GET http://localhost:4006/users
```

### 7. Visualizar Usuário Específico
```http
GET http://localhost:4006/users/04557270077
```

### 8. Ver Saldo Total do Usuário
```http
GET http://localhost:4006/users/04557270077/balance
```

### 9. Ver Extrato do Usuário
```http
GET http://localhost:4006/users/04557270077/statement
```

### 10. Listar Transações
```http
GET http://localhost:4006/users/04557270077/transactions
```

### 11. Open Finance - Obter Dados da Conta
```http
GET http://localhost:4006/open-finance/04557270077
```

### 12. Open Finance - Atualizar Consentimento
```http
PATCH http://localhost:4006/open-finance/04557270077/consent
Content-Type: application/json

{
  "consent": true
}
```

## 🔄 Fluxo Completo de Teste

### Passo 1: Criar Instituição
```json
POST /institutions
{
  "name": "Banco Raul"
}
```

### Passo 2: Criar Usuário
```json
POST /users
{
  "cpf": "04557270077",
  "name": "Raul Lize"
}
```

### Passo 3: Criar Conta
```json
POST /users/04557270077/accounts
{
  "balance": 5000.00,
  "institution_id": 1,
  "consent": true
}
```

### Passo 4: Adicionar Transações
```json
// Entrada
POST /users/04557270077/transactions
{
  "institution_id": 1,
  "description": "Salário",
  "type": "entrada",
  "value": 3000.00,
  "account_id": 1
}

// Saída
POST /users/04557270077/transactions
{
  "institution_id": 1,
  "description": "Mercado",
  "type": "saida",
  "value": 250.00,
  "account_id": 1
}
```

### Passo 5: Verificar Dados
```http
GET /users/04557270077/balance
GET /users/04557270077/statement
GET /open-finance/04557270077
```

## 📝 Notas Importantes

- **Porta:** A API roda na porta `4006`
- **Tipos de transação:** `"entrada"` ou `"saida"`
- **Limitação:** Apenas 1 instituição por API (similar à API Lucas)
- **Consentimento:** Necessário para endpoints Open Finance
- **Relacionamentos:** Um usuário pode ter múltiplas contas, uma conta pertence a uma instituição

## 🗂️ Estrutura do Banco de Dados

```
users
├── id (auto-increment)
├── name
├── cpf (unique)
├── created_at
└── updated_at

institutions
├── id (auto-increment)
├── name
├── created_at
└── updated_at

accounts
├── id (auto-increment)
├── user_cpf (FK)
├── institution_id (FK)
├── balance
├── consent
├── created_at
└── updated_at

transactions
├── id (auto-increment)
├── account_id (FK)
├── description
├── type (entrada/saida)
├── value
├── created_at
└── updated_at
``` 