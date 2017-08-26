'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema
mongoose.Promise = global.Promise;

const ProductoSchema = Schema({
    Titulo: String,
    Parrafo_1: String,
    Url_imagen_1: String,
    Parrafo_2: String,
    Url_imagen_2: String,
    Url_imagen_3: String,
    Url_imagen_4: String
})

module.exports = mongoose.model('Proyectos',  ProductoSchema)