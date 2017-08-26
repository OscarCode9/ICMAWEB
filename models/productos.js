'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema
mongoose.Promise = global.Promise;

const ProductoSchema = Schema({
    Nombre: String,
    Descripcion: String,
    Url_imagen_1: String,
    Url_imagen_2: String,
    Url_imagen_3: String,
    Url_imagen_4: String,
    Url_imagen_5: String,
    video: {
        estado:false,
        video_1: String,
        video_2: String
    },
    Especificacion:[{
        caracteristica: String,
        descripcion: String
    }]
    
})

module.exports = mongoose.model('Productos',  ProductoSchema)

