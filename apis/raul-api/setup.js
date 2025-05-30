// Verifica se dotenv está instalado, senão instala
try {
  require('dotenv');
} catch (e) {
  console.log('Instalando dependência dotenv...');
  require('child_process').execSync('npm install dotenv --no-save', { stdio: 'inherit' });
}

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('Iniciando setup da API Agregadora de Contas Bancárias...');

// Verifica se o arquivo .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️ Arquivo .env não encontrado. Criando a partir do exemplo...');
  try {
    fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
    console.log(
      'Arquivo .env criado com sucesso. Por favor, edite-o com suas configurações antes de continuar.'
    );
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao criar arquivo .env:', error.message);
    process.exit(1);
  }
}

// Função para executar comandos de forma compatível com qualquer SO
function executeCommand(command, args) {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'cmd' : command;
    const cmdArgs = isWindows ? ['/c', command, ...args] : args;

    console.log(`Executando: ${command} ${args.join(' ')}`);

    const proc = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código de saída ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Falha ao executar comando: ${err.message}`));
    });
  });
}

async function setup() {
  try {
    // Instalar dependências
    console.log('\n📦 Instalando dependências...');
    await executeCommand('npm', ['install']);

    // Criar o banco de dados
    console.log('\n🗄️ Criando o banco de dados...');
    await executeCommand('npx', ['sequelize-cli', 'db:create']);

    // Executar migrações
    console.log('\n🔄 Executando migrações...');
    await executeCommand('npx', ['sequelize-cli', 'db:migrate']);

    console.log('\n✅ Setup concluído com sucesso!');
    console.log('\nVocê pode iniciar o servidor com o comando:');
    console.log('npm run dev');
    console.log('\nServiço estará disponível em:', `http://localhost:${process.env.PORT || 3000}`);
  } catch (error) {
    console.error('\n❌ Erro durante o setup:', error.message);
    console.log('\nVerifique se:');
    console.log('1. O PostgreSQL está instalado e em execução');
    console.log('2. As configurações no arquivo .env estão corretas');
    console.log('3. Você tem permissões adequadas para criar bancos de dados');
    console.error('\nErro detalhado:', error);
    process.exit(1);
  }
}

setup();
