// Arquivo: backend/setup.js
// Script para configurar o projeto facilmente

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Raspadinha iGame...\n');

// 1. Verificar se .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Criando arquivo .env...');
  const envContent = `# Arquivo: backend/.env

# Configurações do Servidor
PORT=3001

# Configurações do Banco de Dados MySQL
DB_USER=igamesadmin
DB_HOST=localhost
DB_DATABASE=raspadinha_igame
DB_PASSWORD=123456
DB_PORT=3306

# Chave secreta para gerar os tokens JWT
JWT_SECRET=sua-chave-super-secreta-muito-longa-e-complexa-12345
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado!');
} else {
  console.log('✅ Arquivo .env já existe');
}

// 2. Instalar dependências
console.log('\n📦 Instalando dependências...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependências instaladas!');
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

// 3. Verificar MySQL
console.log('\n🗄️  Verificando MySQL...');
try {
  execSync('mysql --version', { stdio: 'pipe' });
  console.log('✅ MySQL encontrado!');
} catch (error) {
  console.log('⚠️  MySQL não encontrado. Instale o MySQL primeiro.');
  console.log('   Ubuntu/Debian: sudo apt install mysql-server');
  console.log('   macOS: brew install mysql');
  console.log('   Windows: Baixe do site oficial do MySQL');
}

console.log('\n🎯 Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Certifique-se de que o MySQL está rodando');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:3001');
console.log('\n👤 Login admin: admin@raspadinha.com / admin123');
console.log('\n🎮 Boa diversão!');