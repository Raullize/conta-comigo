# ContaComigo 💰

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.en.md)

![ContaComigo Logo](public/assets/logos/logo.png)

## 📋 Descrição

O **ContaComigo** é uma plataforma web inovadora de gerenciamento financeiro pessoal que conecta o usuário ao ecossistema do Open Finance brasileiro. Nossa missão é simplificar a vida financeira dos usuários, oferecendo uma visão consolidada e inteligente de suas finanças em um só lugar.

### 🚀 Características Principais

- **🔗 Integração Completa**: Conecte todas suas contas bancárias, cartões e investimentos através do Open Finance
- **📊 Visualização Inteligente**: Gráficos interativos e relatórios detalhados para entender seus hábitos financeiros
- **🤖 Categorização Automática**: Despesas organizadas automaticamente por palavras-chave
- **🛡️ Segurança Total**: Criptografia de ponta e conformidade com LGPD
- **🎓 Educação Financeira**: Dicas personalizadas e insights para melhorar sua saúde financeira
- **📱 Multiplataforma**: Interface responsiva que funciona em qualquer dispositivo
- **🎯 Metas Financeiras**: Defina e acompanhe suas metas de economia e investimento
- **🔔 Alertas Inteligentes**: Notificações sobre gastos excessivos e oportunidades
- **📈 Mapa de Calor**: Visualize os maiores gastos por categoria

## 🛠️ Tecnologias Utilizadas

### Frontend

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS e animações
- **JavaScript (ES6+)** - Funcionalidades interativas
- **Font Awesome** - Ícones
- **Google Fonts (Inter)** - Tipografia

### Backend (Planejado)

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **PostgreSQL** - Banco de dados

### Ferramentas de Desenvolvimento

- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

## 🗂️ Estrutura do Projeto

```
conta-comigo/
├── public/                 # Arquivos estáticos
│   ├── assets/            # Recursos (imagens, logos, vídeos)
│   ├── css/               # Folhas de estilo
│   │   ├── globals.css    # Estilos globais
│   │   ├── landing.css    # Estilos da landing page
│   │   ├── auth.css       # Estilos de autenticação
│   │   └── dashboard.css  # Estilos do dashboard
│   ├── js/                # Scripts JavaScript
│   │   ├── landing.js     # Funcionalidades da landing
│   │   ├── auth.js        # Autenticação
│   │   └── dashboard.js   # Dashboard
│   ├── pages/             # Páginas HTML
│   │   ├── auth.html      # Login/Cadastro
│   │   └── dashboard.html # Dashboard principal
│   └── index.html         # Landing page
├── src/                   # Código fonte do backend
│   ├── app/               # Aplicação principal
│   ├── config/            # Configurações
│   ├── database/          # Configuração do banco
│   ├── routes/            # Rotas da API
│   └── utils/             # Utilitários
├── config/                # Configurações do projeto
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts
└── README.md              # Documentação
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para instalação

#### 1. Clone o repositório

```bash
git clone https://github.com/Raullize/conta-comigo.git
cd conta-comigo
```

#### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo e configure suas variáveis
cp .env.example .env
```

> ⚠️ **Importante**: Edite o arquivo `.env` com suas configurações específicas

#### 3. Inicie o Docker

- Certifique-se de que o **Docker Desktop** está instalado e em execução na sua máquina
- O Docker é necessário para executar o banco de dados PostgreSQL

#### 4. Suba o banco de dados

```bash
# Inicia o container do PostgreSQL em segundo plano
docker compose up -d
```

#### 5. Instale as dependências

```bash
npm install
```

#### 6. Execute as migrações do banco

```bash
# Cria as tabelas no banco de dados
npx sequelize-cli db:migrate
```

#### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

#### 8. (Opcional) Configure o pgAdmin

Para visualizar e gerenciar o banco de dados:

1. Acesse o pgAdmin no navegador
2. Registre um novo servidor:
   - **General > Name**: ContaComigo DB
   - **Connection > Host**: localhost
   - **Connection > Port**: Use a porta definida em `DB_PORT` no seu `.env`
   - **Connection > Username**: Use o valor de `DB_USER` do seu `.env`
   - **Connection > Password**: Use o valor de `DB_PASS` do seu `.env`

> 🎉 **Pronto!** O projeto estará rodando!

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run lint` - Executa linting do código
- `npm run format` - Formata o código com Prettier

## 🌟 Funcionalidades

### Landing Page

- Design moderno e responsivo
- Animações suaves e micro-interações
- Seções informativas sobre benefícios
- FAQ interativo
- Apresentação da equipe
- Botão "Voltar ao topo" com scroll suave

### Autenticação

- Sistema de login e cadastro
- Validação em tempo real
- Indicador de força da senha
- Máscara para CPF
- Validação de idade
- Sistema de toast para feedback

### Dashboard

- Visão geral das finanças
- Gráficos interativos
- Categorização de gastos
- Metas financeiras
- Relatórios detalhados

## 👥 Contribuidores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Dante-Alsino">
        <img src="https://github.com/Dante-Alsino.png" width="100px;" alt="Dante Alsino"/><br />
        <sub><b>Dante Alsino</b></sub>
      </a><br />
      <sub>Desenvolvedor Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/l-guidotti">
        <img src="https://github.com/l-guidotti.png" width="100px;" alt="Lucas Guidotti"/><br />
        <sub><b>Lucas Guidotti da Silveira</b></sub>
      </a><br />
      <sub>Desenvolvedor Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/patriciapqa">
        <img src="https://github.com/patriciapqa.png" width="100px;" alt="Patricia Quiroz"/><br />
        <sub><b>Patricia Quiroz Adolpho</b></sub>
      </a><br />
      <sub>Desenvolvedor Full Stack</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/Raullize">
        <img src="https://github.com/Raullize.png" width="100px;" alt="Raul Lize"/><br />
        <sub><b>Raul Lize Teixeira</b></sub>
      </a><br />
      <sub>Desenvolvedor Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/CaputiDev">
        <img src="https://github.com/CaputiDev.png" width="100px;" alt="Thiago Caputi"/><br />
        <sub><b>Thiago Rodrigues Caputi</b></sub>
      </a><br />
      <sub>Desenvolvedor Full Stack</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Viitorkm">
        <img src="https://github.com/Viitorkm.png" width="100px;" alt="Vitor Marmitt"/><br />
        <sub><b>Vitor Hugo Kroth Marmitt</b></sub>
      </a><br />
      <sub>Desenvolvedor Full Stack</sub>
    </td>
  </tr>
</table>

## 📞 Contato

Para dúvidas, sugestões ou feedback, entre em contato conosco através dos perfis do GitHub dos contribuidores.

---

<div align="center">
  <p>Desenvolvido com 💙 pela equipe ContaComigo</p>
  <p>🚀 Conectando você ao seu dinheiro</p>
</div>
