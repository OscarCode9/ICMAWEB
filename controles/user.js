'use strict'

const mongoose = require('mongoose');
const User = require('../models/user');
const service = require('../services');
const bcrypt = require('bcrypt-nodejs');

function signUp(req, res){
    console.log(req.fields)
    const user = new User({
        email:req.fields.email,
        displayName:req.fields.displayName,
        password: req.fields.password
    })
    user.save((err)=>{
        if(err){
            res.status(500).send({message: `Error al crear el usuario: ${err}`});
        }else{
            return res.status(200).send({token: service.createToken(user)});
        }
    });
    
}

function signIn(req,res){
    User.find({email: req.body.email, password: req.body},(err,user)=>{
        if(err) return res.status(500).send({message})
        if(!user) return res.status(404).send({message: 'No existe el usuario'})
        req.user = user
        res.status(200).send({
            message: 'Te has logueado correctamente',
            token: service.createToken(user)
        })
    })
    
}




function autentificacionUser(req, res, next) {

    User.find({ email: req.fields.email, password: req.fields.password}, (err, use) => {
        if (err) {
            return res.status(500).send({ message })
        } else if (!use) {
            return res.status(404).send({ message: 'No existe el usuario' })
        } else {
            var password;
            var id; 
            use.forEach(function(element) {
                 password = element.password; 
                 id = element._id;
                 
            }, this);
            console.log(password)
            if(password== undefined){
                console.log("User no encontrado")
                res.redirect('/admin')

            }else if(req.fields.password=== password){
                console.log("User encontrado")
                req.session.user_id =id;
                console.log(req.session)
                res.redirect('/administradores')
            }
            
        }
    })
}

module.exports = {
    signUp,
    signIn,
    autentificacionUser
}