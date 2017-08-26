'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema
mongoose.Promise = global.Promise;

const NoticiasSchema = Schema({
    Titulo: String,
    Contenido: String,
    Fecha:String,
    Estado: Boolean,
    Url_imagen: String
})

module.exports = mongoose.model('Noticias',  NoticiasSchema)

