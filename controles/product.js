'use strict'
const Noticias = require('../models/product');
var fs = require('fs.extra');
const AWS = require('aws-sdk');
const multer = require('multer');

var knox = require('knox');
var client = knox.createClient({
  key: 'AKIAJYECBEDNP4ENJSUA',
  secret: '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',
  bucket: 'icmas'
});


function getProduct(req,res){
    let productId = req.params.productId;
    Noticias.findById(productId,(err, Noticia)=>{
        if(err) {
            return res.status(500).send({message:`Error al realizar la peticion: ${err}`})
            
        }else if(!Noticia){
            return res.status(404).send({message:`El producto no existe`})
            
        }else{
            res.render('actualizar', {Noticia, layout: false});
        }
    });
}
function getUrl(req, id,ale, num, ext) {
    const promise = new Promise(function (resolve, reject) {
      client.putFile(req, `/noticias/${id}_${ale}_${num}.${ext}`, { 'x-amz-acl': 'public-read' }, function (err, response) {
        if (err) reject(err);
        resolve(response.req.url);
      })
    })
    return promise
  }

function saveProduct(req,res){
    console.log(req.files.archivo)
    console.log(req.fields)
    
    const now = new Date();
    let noticias = new Noticias();
    
    if(req.files.archivo){
        var id = noticias._id;
        var exten = req.files.archivo.name.split('.').pop();
        var num = Math.floor((Math.random() * 1000) + 1);
        getUrl(req.files.archivo.path, id, num,1,exten)
        .then (function (data){
            noticias.Url_imagen =data;
        })
        .then(function (){
            noticias.Estado = true;
            noticias.Titulo = req.fields.Titulo;
            noticias.Contenido = req.fields.Contenido; 
            noticias.Fecha = `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
           
            noticias.save((err, producStored)=>{
                if(err) res.status(500).send({message: `Error al salvar en la base de datos: ${err} `})
                res.redirect(`../administradores`);
            }) 
        })
        
    }else{
         noticias.Estado = false;
         noticias.Titulo = req.fields.Titulo;
         noticias.Contenido = req.fields.Contenido; 
         noticias.Fecha = `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
        
         noticias.save((err, producStored)=>{
             if(err) res.status(500).send({message: `Error al salvar en la base de datos: ${err} `})
             res.redirect(`../administradores`);
         }) 
    }
   
   
    
}
function getProducts(req,res){
    Noticias.find({}, (err, noticias)=>{
        if(err) {
            return res.status(500).send({message:`Error al realizar la peticion: ${err}`})
            
        }else if(!noticias){
            return res.status(404).send({message:`No existen`})
            
        }else{
           return res.status(404).send({noticias})
        }
    })
    
}








 function todosLosProductos (req,res) {
   
    Noticias.find({}, (err, noticias)=>{
        if(err) {
            return res.status(500).send({message:`Error al realizar la peticion: ${err}`})
            
        }else if(!noticias){
            return res.status(404).send({message:`No existen`})
            
        }else{ 
            
             res.render('index',{noticias, title: "ICMA", uno: "select", dos: "", tres:"",cuatro:"",cinco:""})
            
        }
        
    })

}

function updateProduct(req,res){
    console.log(req.body);
    let productId = req.params.productId;
    let update = req.fields;
    Noticias.findByIdAndUpdate(productId,update, (err, productUpdated)=>{
        if(err) res.status(500).send({message: `Error al borrar el producto: ${err}`});
        res.status(200).send({product: productUpdated});
    })
    
}
function deleteProduct(req,res){
    console.log(req.params.noticiaId)
    let noticiaId = req.params.noticiaId;
    Noticias.findById(noticiaId, (err, noticia)=>{
        if(err) res.status(500).send({message: `Error al borrar el producto: ${err}`});
        noticia.remove( err =>{
            client.deleteMultiple([
                "/noticias/"+noticia.Url_imagen.split('/').pop()], function (err, res) {
                if (err) console.log(err)
                console.log("El archivo se ha borrado");
              });

            if(err)res.status(500).send({message: `Error al borrar el producto: ${err}`});
            else res.status(200).send({message: 'El producto ha sido eliminado'});
        }) 
    });
    
}

module.exports = {
    getProduct,
    saveProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    todosLosProductos
}