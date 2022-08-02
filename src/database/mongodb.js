const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('Conectando ao mongodb...');
        await mongoose.connect(process.env.MONGODB);
        console.log('Mongodb conectado com sucesso!');
    } catch(error) {
        console.log('Erro de conexao com o mongodb: ' + error);
    }
}
module.exports = connectDB;