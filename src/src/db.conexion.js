const mongoose = require('mongoose');

const conexionDB = async () => {
    try {
        const DB = await mongoose.connect('mongodb://localhost:27017/calidad-del-aire');
        console.log("Conectado con Mongo, ", DB.connection.name);
    } catch (error) {
        console.log(error);
    }
}

module.exports = conexionDB;