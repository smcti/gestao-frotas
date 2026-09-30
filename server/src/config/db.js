const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI não definida no arquivo .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB Atlas conectado com sucesso');
  } catch (err) {
    console.error('Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
