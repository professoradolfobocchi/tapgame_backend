require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');
const mongodb = require('./src/database/mongodb');

mongodb();

const server = express();

server.use(cors(
    {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'PUT', 'UPDATE', 'PATCH'],
        allowedHeaders: ['Content-Type']
    }
));
server.use(express.json());
server.use(express.urlencoded({extended: true}));

server.use('/', apiRoutes);

server.listen(process.env.PORT, () => {
    console.log(`- Rodando no endereco: ${process.env.BASE}.`);
});