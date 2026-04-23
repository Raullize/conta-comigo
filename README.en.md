# ContaComigo 💰

> [!IMPORTANT]
> **Attention**: This repository is now considered the **"legacy"** version. The project is being rebuilt from scratch (v2.0) with a **new high-performance architecture** and **new features based on Artificial Intelligence** for predictive analysis and financial insights. To follow the evolution, join our official organization: [ContaComigo Project](https://github.com/ContaComigo-Project)

---
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](./README.md)

![ContaComigo Logo](public/assets/logos/logo.png)

## 📋 Description

**ContaComigo** is an innovative web platform for personal financial management that connects users to the Brazilian Open Finance ecosystem. Our mission is to simplify users' financial lives by offering a consolidated and intelligent view of their finances in one place.

## 🎬 Demo

See ContaComigo in action! Check out our complete demonstration of the main features:

<div align="center">
  <img src="public/assets/images/demo.gif" alt="ContaComigo Demo" width="800">
</div>

> 📱 **Want to see more details?** [Click here to view in full size](public/assets/images/demo.gif)

> ⏳ **Note**: The demo may take a few seconds to load due to file size. Please wait!

### 🚀 Key Features

- **🔗 Complete Integration**: Connect all your bank accounts, cards, and investments through Open Finance
- **📊 Smart Visualization**: Interactive charts and detailed reports to understand your financial habits
- **🤖 Automatic Categorization**: Expenses automatically organized by keywords
- **🛡️ Total Security**: End-to-end encryption and LGPD compliance
- **🎓 Financial Education**: Personalized tips and insights to improve your financial health
- **📱 Multi-platform**: Responsive interface that works on any device
- **🎯 Financial Goals**: Set and track your savings and investment goals
- **🔔 Smart Alerts**: Notifications about excessive spending and opportunities
- **📈 Heat Map**: Visualize your biggest expenses by category

## 🛠️ Technologies Used

### Frontend

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS variables and animations
- **JavaScript (ES6+)** - Interactive functionalities
- **Font Awesome** - Icons
- **Google Fonts (Inter)** - Typography

### Backend (Planned)

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - Database ORM
- **PostgreSQL** - Database

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 🗂️ Project Structure

```
conta-comigo/
├── public/                 # Static files (Frontend)
│   ├── assets/            # Static resources
│   │   ├── images/        # Images used on the site
│   │   ├── logos/         # Application logos
│   │   └── videos/        # Videos for presentations
│   ├── css/               # Stylesheets
│   │   ├── globals.css    # CSS variables and global styles
│   │   ├── common.css     # Shared styles between pages
│   │   ├── landing.css    # Landing page styles
│   │   ├── login.css      # Login page styles
│   │   ├── dashboard.css  # Dashboard styles
│   │   ├── expenses.css   # Expenses page styles
│   │   ├── investments.css # Investments page styles
│   │   ├── institutions.css # Institutions page styles
│   │   ├── simulator.css  # Simulator page styles
│   │   ├── settings.css   # Settings page styles
│   │   ├── modal.css      # General modal styles
│   │   └── components/    # Reusable CSS components
│   │       ├── header.css # Header styles
│   │       ├── sidebar.css # Sidebar styles
│   │       └── openFinanceModal.css # Open Finance modal styles
│   ├── js/                # JavaScript scripts
│   │   ├── auth-utils.js  # Authentication utilities
│   │   ├── utils.js       # General utility functions
│   │   ├── landing.js     # Landing page functionalities
│   │   ├── login.js       # Login functionalities
│   │   ├── dashboard.js   # Dashboard functionalities
│   │   ├── expenses.js    # Expenses page functionalities
│   │   ├── investments.js # Investments page functionalities
│   │   ├── institutions.js # Institutions page functionalities
│   │   ├── simulator.js   # Simulator page functionalities
│   │   ├── settings.js    # Settings page functionalities
│   │   └── components/    # Reusable JavaScript components
│   │       ├── header.js  # Header component
│   │       ├── sidebar.js # Sidebar component
│   │       └── openFinanceModal.js # Open Finance modal component
│   ├── pages/             # HTML pages
│   │   ├── login.html     # Login/registration page
│   │   ├── dashboard.html # Main dashboard
│   │   ├── expenses.html  # Expenses page
│   │   ├── investments.html # Investments page
│   │   ├── institutions.html # Institutions page
│   │   ├── simulator.html # Simulator page
│   │   └── settings.html  # Settings page
│   └── index.html         # Landing page
├── src/                   # Main backend source code
│   ├── app/               # Main application
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Authentication and validation middlewares
│   │   ├── models/        # Data models (Sequelize)
│   │   └── validators/    # Input validators
│   ├── database/          # Database configuration
│   │   ├── migrations/    # Database migrations
│   │   ├── seeders/       # Initial data for the database
│   │   ├── config.js      # Connection configurations
│   │   ├── database.js    # Database instance
│   │   └── index.js       # Database entry point
│   ├── routes/            # API route definitions
│   │   └── routes.js      # Main routes file
│   ├── app.js             # Express application configuration
│   └── server.js          # HTTP server
├── apis/                  # API microservices (6 independent APIs)
│   ├── caputi-api/        # Authentication Service
│   ├── dante-api/         # Transactions Service
│   ├── lucas-api/         # Institutions Service
│   ├── patricia-api/      # Categories Service
│   ├── raul-api/          # Users Service
│   └── vitor-api/         # Investments Service
├── docker-compose.yml     # Docker Compose configuration
├── dockerfile             # Main Docker configuration
├── entrypoint.sh          # Docker entry script
├── .env.example           # Environment variables example
├── .sequelizerc           # Sequelize CLI configuration
├── package.json           # Project dependencies and scripts
├── .eslintrc.js           # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .dockerignore          # Files ignored by Docker
├── .gitignore             # Files ignored by Git
├── .gitattributes         # Git attributes configuration
├── README.md              # Portuguese documentation
├── README.en.md           # English documentation
└── wait-for-db.js         # Database wait script
```

## ⚙️ Installation and Setup

### Prerequisites

- Docker Desktop (recommended)
- Docker Compose
- Node.js (version 16 or higher) - only for manual installation
- npm - only for manual installation

### Installation Steps

#### 1. Clone the repository

```bash
git clone https://github.com/Raullize/conta-comigo.git
cd conta-comigo
```

#### 2. Configure environment variables

```bash
# Copy the example file and configure your variables
cp .env.example .env
```

> ⚠️ **Important**: Edit the `.env` file with your specific configurations

#### 3. Installation with Docker (Recommended)

- Make sure **Docker Desktop** is installed and running on your machine
- Docker automates several steps of the installation process, including:
  - PostgreSQL database configuration
  - Dependencies installation (npm install)
  - Database migrations
  - Initialization of all APIs and services

```bash
# Start all services in Docker containers
npm run dev
```

> 💡 **Tip**: After starting the services, you can access:
> - **ContaComigo**: http://localhost:4000
> - **Caputi API**: http://localhost:4001
> - **Dante API**: http://localhost:4002
> - **Lucas API**: http://localhost:4003
> - **Patricia API**: http://localhost:4004
> - **Vitor API**: http://localhost:4005
> - **Raul API**: http://localhost:4006

#### 4. Manual Installation (Alternative)

If you prefer not to use Docker, you'll need to:

```bash
# Install dependencies
npm install

# Configure and start PostgreSQL databases manually

# Run migrations
npm run migrate

# Start the development server
npm start
```

> ⚠️ **Attention**: Manual installation requires more work and additional configuration for each database.

#### 5. (Optional) Configure pgAdmin

To view and manage the database:

1. Access pgAdmin in your browser
2. Register a new server:
   - **General > Name**: ContaComigo DB
   - **Connection > Host**: localhost
   - **Connection > Port**: Use the port defined in `DB_PORT` in your `.env`
   - **Connection > Username**: Use the value from `DB_USER` in your `.env`
   - **Connection > Password**: Use the value from `DB_PASS` in your `.env`

> 🎉 **Ready!** The project will be running!

### Available Scripts

- `npm start` - Starts the development server (without Docker)
- `npm run dev` - Starts all services using Docker (recommended)
- `npm run serve` - Starts a simple HTTP server for static files
- `npm run lint` - Runs code linting
- `npm run lint:fix` - Runs linting and fixes issues automatically
- `npm run format` - Formats code with Prettier
- `npm run format:check` - Checks if code is properly formatted
- `npm run migrate` - Runs database migrations
- `npm run down` - Stops all Docker containers and removes volumes

## 🔧 Data Configuration for Testing

### ⚠️ Important: CPF Synchronization

To use **ContaComigo** correctly, it is **essential** that the CPF of the user created on the platform is **exactly the same** as the CPF of users registered in the microservices APIs databases. This synchronization is necessary for the system to correlate financial data with the correct user.

### 🛠️ Using Insomnia for Data Registration

It is **highly recommended** to use **Insomnia** (or similar tools like Postman) for initial data registration in the microservices APIs.

#### 🏦 Important: Each API = One Financial Institution

Each API functions as an **independent financial institution**. This means you need to register data **separately in each API** you want to test. For example:
- **Caputi-API** = Caputi Bank
- **Dante-API** = Dante Bank  
- **Lucas-API** = Lucas Bank
- **Patricia-API** = Patricia Bank
- **Raul-API** = Raul Bank
- **Vitor-API** = Vitor Bank

#### Data to Register per API:
- **🏦 One Financial Institution** (one per API)
- **👤 One User** (with identical CPF used in ContaComigo)
- **💳 Bank Accounts** (linked to the user)
- **💰 Financial Transactions**
- **📋 Open Finance Consents**

#### Recommended Flow (Repeat for each API):
1. **First**: Register a financial institution in the API
2. **Second**: Register the user with the **same CPF** that will be used in ContaComigo
3. **Third**: Register bank accounts linked to the user
4. **Fourth**: Add financial transactions for the account
5. **Fifth**: Configure Open Finance consents if necessary

> ⚠️ **Remember**: Repeat this process **individually for each API** you want to test. The more APIs you configure, the more financial institutions will appear in ContaComigo!

> 💡 **Tip**: Keep CPFs synchronized between the frontend (ContaComigo) and the APIs to ensure proper integration between services.

## 🌟 Features

### Landing Page

- Modern and responsive design
- Smooth animations and micro-interactions
- Informative sections about benefits
- Interactive FAQ
- Team presentation
- "Back to top" button with smooth scroll

### Authentication

- Login and registration system
- Real-time validation
- Password strength indicator
- CPF mask
- Age validation
- Toast system for feedback

### Dashboard

- Financial overview
- Interactive charts
- Expense categorization
- Financial goals
- Detailed reports

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Dante-Alsino">
        <img src="https://github.com/Dante-Alsino.png" width="100px;" alt="Dante Alsino"/><br />
        <sub><b>Dante Alsino</b></sub>
      </a><br />
      <sub>Web Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/l-guidotti">
        <img src="https://github.com/l-guidotti.png" width="100px;" alt="Lucas Guidotti"/><br />
        <sub><b>Lucas Guidotti da Silveira</b></sub>
      </a><br />
      <sub>Web Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/patriciapqa">
        <img src="https://github.com/patriciapqa.png" width="100px;" alt="Patricia Quiroz"/><br />
        <sub><b>Patricia Quiroz Adolpho</b></sub>
      </a><br />
      <sub>Web Developer</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/Raullize">
        <img src="https://github.com/Raullize.png" width="100px;" alt="Raul Lize"/><br />
        <sub><b>Raul Lize Teixeira</b></sub>
      </a><br />
      <sub>Web Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/CaputiDev">
        <img src="https://github.com/CaputiDev.png" width="100px;" alt="Thiago Caputi"/><br />
        <sub><b>Thiago Rodrigues Caputi</b></sub>
      </a><br />
      <sub>Web Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Viitorkm">
        <img src="https://github.com/Viitorkm.png" width="100px;" alt="Vitor Marmitt"/><br />
        <sub><b>Vitor Hugo Kroth Marmitt</b></sub>
      </a><br />
      <sub>Web Developer</sub>
    </td>
  </tr>
</table>

---

<div align="center">
  <p>Developed with 💙 by the ContaComigo team</p>
  <p>🚀 Connecting you to your money</p>
</div>
