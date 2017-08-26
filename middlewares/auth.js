'use strict'
const servicios = require('../services');

function isAuth (req, res, next){
  if(!req.headers.authorization||req.headers.authorizatio == undefined ){
    var respuesta ={mensaje: false}
    return res.json(respuesta);
  }
  const token = req.headers.authorization.split(' ')[1];
  console.log("o hay nada "+ token);
  servicios.decodeToken(token)
  .then(response =>{
    req.user = response
    console.log("o logeado"+req.user);
    next()
  })
  .catch(response =>{
    res.status(response.status)
  })
}

module.exports = isAuth