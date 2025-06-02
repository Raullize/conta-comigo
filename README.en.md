# ContaComigo 💰

[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](./README.md)

![ContaComigo Logo](public/assets/logos/logo.png)

## 📋 Description

**ContaComigo** is an innovative web platform for personal financial management that connects users to the Brazilian Open Finance ecosystem. Our mission is to simplify users' financial lives by offering a consolidated and intelligent view of their finances in one place.

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
├── public/                 # Static files
│   ├── assets/            # Resources (images, logos, videos)
│   ├── css/               # Stylesheets
│   │   ├── globals.css    # Global styles
│   │   ├── landing.css    # Landing page styles
│   │   ├── auth.css       # Authentication styles
│   │   └── dashboard.css  # Dashboard styles
│   ├── js/                # JavaScript scripts
│   │   ├── landing.js     # Landing functionalities
│   │   ├── auth.js        # Authentication
│   │   └── dashboard.js   # Dashboard
│   ├── pages/             # HTML pages
│   │   ├── auth.html      # Login/Register
│   │   └── dashboard.html # Main dashboard
│   └── index.html         # Landing page
├── src/                   # Backend source code
│   ├── app/               # Main application
│   ├── config/            # Configurations
│   ├── database/          # Database configuration
│   ├── routes/            # API routes
│   └── utils/             # Utilities
├── config/                # Project configurations
├── .env.example           # Environment variables example
├── package.json           # Dependencies and scripts
└── README.md              # Documentation
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

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
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/l-guidotti">
        <img src="https://github.com/l-guidotti.png" width="100px;" alt="Lucas Guidotti"/><br />
        <sub><b>Lucas Guidotti da Silveira</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/patriciapqa">
        <img src="https://github.com/patriciapqa.png" width="100px;" alt="Patricia Quiroz"/><br />
        <sub><b>Patricia Quiroz Adolpho</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/Raullize">
        <img src="https://github.com/Raullize.png" width="100px;" alt="Raul Lize"/><br />
        <sub><b>Raul Lize Teixeira</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/CaputiDev">
        <img src="https://github.com/CaputiDev.png" width="100px;" alt="Thiago Caputi"/><br />
        <sub><b>Thiago Rodrigues Caputi</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Viitorkm">
        <img src="https://github.com/Viitorkm.png" width="100px;" alt="Vitor Marmitt"/><br />
        <sub><b>Vitor Hugo Kroth Marmitt</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

---

<div align="center">
  <p>Developed with 💙 by the ContaComigo team</p>
  <p>🚀 Connecting you to your money</p>
</div>
