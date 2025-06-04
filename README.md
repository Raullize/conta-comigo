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
│   │   ├── globals.css    # Variáveis e estilos base
│   │   ├── common.css     # Estilos compartilhados entre páginas
│   │   ├── landing.css    # Estilos da landing page
│   │   ├── auth.css       # Estilos de autenticação
│   │   ├── dashboard.css  # Estilos do dashboard
│   │   ├── expenses.css   # Estilos da página de despesas
│   │   ├── investments.css # Estilos da página de investimentos
│   │   ├── institutions.css # Estilos da página de instituições
│   │   ├── simulator.css  # Estilos da página de simulador
│   │   ├── settings.css   # Estilos da página de configurações
│   │   └── components/    # Componentes reutilizáveis
│   │       ├── header.css # Estilos do cabeçalho
│   │       └── sidebar.css # Estilos da barra lateral
│   ├── js/                # Scripts JavaScript
│   │   ├── landing.js     # Funcionalidades da landing
│   │   ├── auth.js        # Autenticação
│   │   ├── common.js      # Funções compartilhadas
│   │   ├── dashboard.js   # Dashboard
│   │   ├── expenses.js    # Página de despesas
│   │   ├── investments.js # Página de investimentos
│   │   ├── institutions.js # Página de instituições
│   │   ├── simulator.js   # Página de simulador
│   │   ├── settings.js    # Página de configurações
│   │   └── components/    # Componentes reutilizáveis
│   │       ├── header.js  # Componente de cabeçalho
│   │       └── sidebar.js # Componente de barra lateral
│   ├── pages/             # Páginas HTML
│   │   ├── auth.html      # Login/Cadastro
│   │   ├── dashboard.html # Dashboard principal
│   │   ├── expenses.html  # Página de despesas
│   │   ├── investments.html # Página de investimentos
│   │   ├── institutions.html # Página de instituições
│   │   ├── simulator.html # Página de simulador
│   │   └── settings.html  # Página de configurações
│   └── index.html         # Landing page
├── src/                   # Código fonte do backend
│   ├── app/               # Aplicação principal
│   │   ├── controllers/   # Controladores
│   │   ├── middlewares/   # Middlewares
│   │   ├── models/        # Modelos de dados
│   │   └── validators/    # Validadores
│   ├── database/          # Configuração do banco
│   │   ├── migrations/    # Migrações
│   │   └── seeders/       # Dados iniciais
│   ├── routes/            # Rotas da API
│   ├── app.js             # Configuração da aplicação
│   └── server.js          # Servidor
├── apis/                  # APIs microserviços
│   ├── caputi-api/        # API de Thiago Caputi
│   ├── dante-api/         # API de Dante Alsino
│   ├── lucas-api/         # API de Lucas Guidotti
│   ├── patricia-api/      # API de Patricia Quiroz
│   ├── raul-api/          # API de Raul Lize
│   └── vitor-api/         # API de Vitor Marmitt
├── docker-compose.yml     # Configuração Docker Compose
├── dockerfile             # Configuração Docker
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json           # Dependências e scripts
└── README.md              # Documentação
```

## ⚙️ Instalação e Configuração

### Pré-requisitos

- Docker Desktop (recomendado)
- Docker Compose
- Node.js (versão 16 ou superior) - apenas para instalação manual
- npm - apenas para instalação manual

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

#### 3. Instalação com Docker (Recomendado)

- Certifique-se de que o **Docker Desktop** está instalado e em execução na sua máquina
- O Docker automatiza diversas etapas do processo de instalação, incluindo:
  - Configuração dos bancos de dados PostgreSQL
  - Instalação de dependências (npm install)
  - Execução de migrações do banco de dados
  - Inicialização de todas as APIs e serviços

```bash
# Inicia todos os serviços em containers Docker
npm run dev
```

> 💡 **Dica**: Após iniciar os serviços, você pode acessar:
> - **ContaComigo**: http://localhost:4000
> - **API Caputi**: http://localhost:4001
> - **API Dante**: http://localhost:4002
> - **API Lucas**: http://localhost:4003
> - **API Patricia**: http://localhost:4004
> - **API Vitor**: http://localhost:4005
> - **API Raul**: http://localhost:4006

#### 4. Instalação Manual (Alternativa)

Se preferir não usar Docker, você precisará:

```bash
# Instalar dependências
npm install

# Configurar e iniciar bancos de dados PostgreSQL manualmente

# Executar migrações
npm run migrate

# Iniciar o servidor de desenvolvimento
npm start
```

> ⚠️ **Atenção**: A instalação manual é mais trabalhosa e requer configuração adicional de cada banco de dados.

#### 5. (Opcional) Configure o pgAdmin

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

- `npm start` - Inicia o servidor de desenvolvimento (sem Docker)
- `npm run dev` - Inicia todos os serviços usando Docker (recomendado)
- `npm run serve` - Inicia um servidor HTTP simples para os arquivos estáticos
- `npm run lint` - Executa linting do código
- `npm run lint:fix` - Executa linting e corrige problemas automaticamente
- `npm run format` - Formata o código com Prettier
- `npm run format:check` - Verifica se o código está formatado corretamente
- `npm run migrate` - Executa migrações do banco de dados
- `npm run down` - Para todos os containers Docker e remove volumes

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
