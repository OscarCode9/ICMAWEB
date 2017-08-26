'use strict'
const Noticias = require('../models/product');
var fs = require('fs.extra');
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

function saveProduct(req,res){
    console.log(req.files.name)
    console.log(req.fields)
    const now = new Date();
    let noticias = new Noticias();
    
   
    if(req.files.archivo){
        var exten = req.files.archivo.name.split('.').pop();
        fs.copy(req.files.archivo.path, "public/imagenes/"+noticias._id+"."+ exten);
        noticias.Url_imagen = `imagenes/${noticias._id}.${exten}`;
        
        noticias.Estado = true;
    }else{
         noticias.Estado = false;
    }
   
   
    noticias.Titulo = req.fields.Titulo;
    noticias.Contenido = req.fields.Contenido; 
    noticias.Fecha = `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
   
    noticias.save((err, producStored)=>{
        if(err) res.status(500).send({message: `Error al salvar en la base de datos: ${err} `})
        res.redirect(`../administradores`);
    }) 
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
            if(err)res.status(500).send({message: `Error al borrar el producto: ${err}`});
            res.status(200).send({message: 'El producto ha sido eliminado'});
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