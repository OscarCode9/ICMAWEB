const express = require('express')
const ProductCtrl = require('../controles/product');
const api = express.Router();
const auth = require('../middlewares/auth');
const userCtrl = require('../controles/user');
const Noticias = require('../models/product');
const Producto = require('../models/productos');
const Proyecto = require('../models/proyectos');
const fs = require('fs.extra');
const fss = require('fs');
const AWS = require('aws-sdk');
const multer = require('multer');

var knox = require('knox');
var client = knox.createClient({
  key: 'AKIAJYECBEDNP4ENJSUA',
  secret: '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',
  bucket: 'icmas'
});



api.get('/proyecto', (req, res) => {
  if (req.session.user_id) {
    Proyecto.find({}, (err, pro) => {
      if (err) {
        return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
      } else if (!pro) {
        return res.status(404).send({ message: `No existen` })
      } else {
        res.render('proyectos', { proyectos: pro, layout: false });
      }
    })

  } else {
    res.redirect('/admin');
  }

});
api.post('/proyecto', (req, res) => {

  console.log(req.fields);
  console.log(req.files);

  const data = req.fields;

  let proyecto = new Proyecto();

  var ex1 = req.files.archivo_1.name.split('.').pop();
  var ex2 = req.files.archivo_2.name.split('.').pop();
  var ex3 = req.files.archivo_3.name.split('.').pop();
  var ex4 = req.files.archivo_4.name.split('.').pop();

  fs.copy(req.files.archivo_1.path, "public/imagenes/proyectos/" + proyecto._id + "_1" + "." + ex1);
  fs.copy(req.files.archivo_2.path, "public/imagenes/proyectos/" + proyecto._id + "_2" + "." + ex2);
  fs.copy(req.files.archivo_3.path, "public/imagenes/proyectos/" + proyecto._id + "_3" + "." + ex3);
  fs.copy(req.files.archivo_4.path, "public/imagenes/proyectos/" + proyecto._id + "_4" + "." + ex4);

  var gen_1 = "imagenes/proyectos/" + proyecto._id + "_1" + "." + ex1;
  var gen_2 = "imagenes/proyectos/" + proyecto._id + "_2" + "." + ex2;
  var gen_3 = "imagenes/proyectos/" + proyecto._id + "_3" + "." + ex3;
  var gen_4 = "imagenes/proyectos/" + proyecto._id + "_4" + "." + ex4;

  proyecto.Titulo = data.Titulo;
  proyecto.Parrafo_1 = data.Parrafo_1;
  proyecto.Parrafo_2 = data.Parrafo_2;
  proyecto.Url_imagen_1 = gen_1;
  proyecto.Url_imagen_2 = gen_2;
  proyecto.Url_imagen_3 = gen_3;
  proyecto.Url_imagen_4 = gen_4;

  proyecto.save((err, proyecto) => {
    if (err) {
      res.status(500).send({ mesaanje: "Error al guardar los datos compa" })
    } else {
      res.redirect('/api/proyecto');
    }
  });


});

api.get('/proyectoById/:id', (req, res) => {
  let proyectoID = req.params.id;
  Proyecto.findById(proyectoID, (err, Proyecto) => {
    if (err) {
      return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
    } else if (!Proyecto) {
      return res.status(404).send({ message: `El producto no existe` })
    } else {
      res.render('ProyecActu', { Proyecto, layout: false });
    }
  });

});



api.put('/proyectoById/:id', (req, res) => {
  console.log("¿que vergas esta pasando?")

  let update = req.fields;
  let productId = req.params.id;
  console.log(update);
  let urls = ["public/" + req.fields.Url_imagen_1,
  "public/" + req.fields.Url_imagen_2,
  "public/" + req.fields.Url_imagen_3,
  "public/" + req.fields.Url_imagen_4];

  if (req.files.archivo_1 && req.files.archivo_2) {
    urls.forEach(function (url) {

      fss.stat(url, function (err, stats) {
        console.log(stats);//here we got all information of file in stats variable
        if (err) {
          console.error(err);
        }

        fss.unlink(url, function (err) {
          if (err) console.log(err);
          console.log('file deleted successfully');
        });

      });
    }, this);

    var exten1 = req.files.archivo_1.name.split('.').pop();
    var exten2 = req.files.archivo_2.name.split('.').pop();
    var exten3 = req.files.archivo_3.name.split('.').pop();
    var exten4 = req.files.archivo_4.name.split('.').pop();
    var num = Math.floor((Math.random() * 1000) + 1);
    console.log(num)
    var id = req.fields._id;
    var dire2 = "imagenes/proyectos/" + id + num + "_2" + "." + exten2;
    var dire1 = "imagenes/proyectos/" + id + num + "_1" + "." + exten1;
    var dire3 = "imagenes/proyectos/" + id + num + "_3" + "." + exten3;
    var dire4 = "imagenes/proyectos/" + id + num + "_4" + "." + exten4;
    var dires = [dire1, dire2, dire3, dire4];

    fs.copy(req.files.archivo_1.path, 'public/' + dire1)
    fs.copy(req.files.archivo_2.path, 'public/' + dire2)
    fs.copy(req.files.archivo_3.path, 'public/' + dire3)
    fs.copy(req.files.archivo_4.path, 'public/' + dire4)

    update.Url_imagen_1 = dire1;
    update.Url_imagen_2 = dire2;
    update.Url_imagen_3 = dire3;
    update.Url_imagen_4 = dire4;




  }
  Proyecto.findByIdAndUpdate(productId, update, (err, productUpdated) => {
    if (err) res.status(500).send({ message: `Error al actualizar el producto: ${err}` });
    res.status(200).send({ product: productUpdated });
  })


});
api.delete('/proyecto/:id', (req, res) => {
  console.log(req.params.id)
  let proyectoId = req.params.id;
  Proyecto.findById(proyectoId, (err, pro) => {
    if (err) res.status(500).send({ message: `Error al borrar el producto: ${err}` });
    pro.remove(err => {
      if (err) res.status(500).send({ message: `Error al borrar el producto: ${err}` });
      let urls_2 = ["public/" + pro.Url_imagen_1,
      "public/" + pro.Url_imagen_2,
      "public/" + pro.Url_imagen_3,
      "public/" + pro.Url_imagen_4];

      urls_2.forEach(function (url) {
        fss.stat(url, function (err, stats) {
          console.log(stats);//here we got all information of file in stats variable
          if (err) {
            console.error(err);
          }
          fss.unlink(url, function (err) {
            if (err) console.log(err);
            console.log('file deleted successfully');
          });

        });
      }, this);
      res.status(200).send({ message: 'El producto ha sido eliminado' });
    })
  });


});



function getUrl(req, id, ale, num, ext) {
  const promise = new Promise(function (resolve, reject) {
    client.putFile(req, `${id}_${ale}_${num}.${ext}`, { 'x-amz-acl': 'public-read' }, function (err, response) {
      if (err) reject(err);
      resolve(response.req.url);
    })
  })
  
  return promise
}
api.get('/product', ProductCtrl.getProducts)
api.get('/product/:productId', ProductCtrl.getProduct)

api.post('/product', multer({ dest: './noticias' }).single('upl'), ProductCtrl.saveProduct)

api.post('/NewProduct', multer({ dest: './' }).single('upl'), (req, res) => {

  let producto = new Producto();
  var obj = req.fields;
  var cont = 0;

  //inicializar objeto para  insertar en el arreglo de la base de datos 
  var Espe = {
    caracteristica: "",
    descripcion: ""
  }

  // sacar la extencion de las imagenes que se mandaron
  var exten_1 = req.files.archivo_1.name.split('.').pop();
  var exten_2 = req.files.archivo_2.name.split('.').pop();
  var exten_3 = req.files.archivo_3.name.split('.').pop();
  var exten_4 = req.files.archivo_4.name.split('.').pop();
  var exten_5 = req.files.archivo_5.name.split('.').pop();

  //copiar imagenes a un ruta del servidor
  var num = Math.floor((Math.random() * 1000) + 1);
  var arregloUrls = [];
  getUrl(req.files.archivo_1.path, producto._id, num, 1, exten_1)
    .then(function (data) {
      producto.Url_imagen_1 = data;
      return getUrl(req.files.archivo_2.path, producto._id, num, 2, exten_2)
    })
    .then(function (data) {
      producto.Url_imagen_2 = data;
      return getUrl(req.files.archivo_3.path, producto._id, num, 3, exten_3)
    })
    .then(function (data) {
      producto.Url_imagen_3 = data;
      return getUrl(req.files.archivo_4.path, producto._id, num, 4, exten_4)

    })
    .then(function (data) {
      producto.Url_imagen_4 = data;
      return getUrl(req.files.archivo_5.path, producto._id, num, 5, exten_5)

    })
    .then(function (data) {
      producto.Url_imagen_5 = data;
      producto.Nombre = req.fields.Nombre;
      producto.Descripcion = req.fields.Descripcion;
      if (req.fields.video_1 && req.fields.video_2) {
        producto.video.estado = true;
        producto.video.video_1 = req.fields.video_1;
        producto.video.video_2 = req.fields.video_2;
      } else {
        producto.video.estado = false;
        producto.video.video_1 = "";
        producto.video.video_2 = "";

      }

      function insertArray(a, b) {
        if (cont >= a) {
          if (cont % 2 === 0) {
            Espe.caracteristica = obj[i];
          } else {
            Espe.descripcion = obj[i];
          }
        }
        if (cont >= b && cont % 2 === 0) {
          producto.Especificacion.push(Espe);
        }
        cont++;
      }
      console.log(req.fields);
      if (req.fields.espe1_1 && req.fields.espe2_1) {
        for (var i = 0 in obj) {
          if (req.fields.video_1 && req.fields.video_2) {
            insertArray(4, 6);
          } else {
            insertArray(4 - 2, 6 - 2);
          }
        }

        producto.Especificacion.push(Espe);

      } else {
        console.log("No se agrego espeficicaciones");
      }

      producto.save((err, producStored) => {
        if (err) res.status(500).send({ message: `Error al salvar en la base de datos: ${err} ` })
        res.redirect('/api/Getproductos');
      })
    })
});

api.get('/GetProductos', (req, res) => {
  if (req.session.user_id) {
    Producto.find({}, (err, pro) => {
      if (err) {
        return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
      } else if (!pro) {
        return res.status(404).send({ message: `No existen` })
      } else {
        res.render('productosAdmin', { productos: pro, layout: false });
      }
    })

  } else {
    res.redirect('/admin');
  }

});

api.get('/GetProductos/:productId', (req, res) => {


  let productId = req.params.productId;
  var sin_fotos = true;


  Producto.findById(productId, (err, Producto) => {
    if (err) {
      return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
    } else if (!Producto) {
      return res.status(404).send({ message: `El producto no existe` })
    } else {

      if ((Producto.Url_imagen_1 == "" ||
        Producto.Url_imagen_2 == "" ||
        Producto.Url_imagen_3 == "" ||
        Producto.Url_imagen_4 == "")) {
        sin_fotos = false;
      }

    }
  });

  Producto.findById(productId, (err, Producto) => {
    if (err) {
      return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
    } else if (!Producto) {
      return res.status(404).send({ message: `El producto no existe` })
    } else {
      var numero_chido

      if (Producto.Especificacion == null) {
        numero_chido = 0;
      } else {
        numero_chido = Number(Producto.Especificacion.length);
      }





      res.render('actualizarPro', { Producto, sin_fotos, numero_chido, layout: false });
    }
  });

})

api.put('/productoID', function (req, res) {



  console.log(req.query.id)
  var id = req.query.id;
  console.log(id);
  var pathImg1 = req.files.img1.path;
  var exten1 = req.files.img1.name.split('.').pop();

  console.log(req.query)

  var img1 = req.query.img1;
  var img2 = req.query.img2;
  var img3 = req.query.img3;
  var img4 = req.query.img4;
  var img5 = req.query.img5;

 



  Producto.findById(id, function (err, tank) {
    if (err) return handleError(err);
    function eliminarURlimg(url) {
      client.deleteMultiple([
        url], function (err, res) {
          if (err) console.log(err)
          console.log(res);
        });
    }

    var num = Math.floor((Math.random() * 1000) + 1);
    getUrl(pathImg1, id, num, 1, exten1)
      .then(function (data) {
        var objDato = {};
        if (img1) {
          eliminarURlimg("/" + tank.Url_imagen_1.split('/').pop())
          objDato = { Url_imagen_1: data }
        } else if (img2) {
          eliminarURlimg("/" + tank.Url_imagen_2.split('/').pop())
          objDato = { Url_imagen_2: data }
        } else if (img3) {
          eliminarURlimg("/" + tank.Url_imagen_3.split('/').pop())
          objDato = { Url_imagen_3: data }
        } else if (img4) {
          eliminarURlimg("/" + tank.Url_imagen_4.split('/').pop())
          objDato = { Url_imagen_4: data }
        } else if (img5) {
          eliminarURlimg("/" + tank.Url_imagen_5.split('/').pop())
          objDato = { Url_imagen_5: data }
        }
        tank.set(objDato);
        tank.save(function (err, updatedTank) {
          if (err) return handleError(err);
          res.send({ url: data });
        });
      })
  });
})
api.put('/GetProductos/:productoId', (req, res) => {
  let productId = req.params.productoId;



  Producto.findById(productId, (err, producto_X) => {
    if (err) {
      return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
    } else if (!producto_X) {
      return res.status(404).send({ message: `El producto no existe` })
    } else {

      let update = {};
      if (req.fields.espe1_1 && req.fields.espe2_1) {
        update.Especificacion = [];
      }

      console.log("VideO we: " + producto_X.video.video_2);
      console.log("VideO we: " + producto_X.video.video_1);


      update.video = {
        video_2: producto_X.video.video_2,
        video_1: producto_X.video.video_1,
        estado: true
      }

      if (req.files.archivo_1 && req.files.archivo_2) {

        client.deleteMultiple([
          "/" + producto_X.Url_imagen_1.split('/').pop(),
          "/" + producto_X.Url_imagen_2.split('/').pop(),
          "/" + producto_X.Url_imagen_3.split('/').pop(),
          "/" + producto_X.Url_imagen_4.split('/').pop(),
          "/" + producto_X.Url_imagen_5.split('/').pop()], function (err, res) {
            if (err) console.log(err)
            console.log(res);
          });

        var exten1 = req.files.archivo_1.name.split('.').pop();
        var exten2 = req.files.archivo_2.name.split('.').pop();
        var exten3 = req.files.archivo_3.name.split('.').pop();
        var exten4 = req.files.archivo_4.name.split('.').pop();
        var exten5 = req.files.archivo_5.name.split('.').pop();
        var num = Math.floor((Math.random() * 1000) + 1);

        var id = req.fields._id;

        getUrl(req.files.archivo_1.path, id, num, 1, exten1)
          .then(function (data) {
            update.Url_imagen_1 = data;
            return getUrl(req.files.archivo_2.path, id, num, 2, exten2)
          })
          .then(function (data) {
            update.Url_imagen_2 = data;
            return getUrl(req.files.archivo_3.path, id, num, 3, exten3)
          })
          .then(function (data) {
            update.Url_imagen_3 = data;
            return getUrl(req.files.archivo_4.path, id, num, 4, exten4)

          })
          .then(function (data) {
            update.Url_imagen_4 = data;
            return getUrl(req.files.archivo_5.path, id, num, 5, exten5)

          })
          .then(function (data) {
            update.Url_imagen_5 = data;
            var obj = req.fields;
            var cont = 0;

            var EspeJoder = {}
            var contento = 0;


            console.log("Verga we:" + req.fields.video_1 && req.fields.video_2);

            if (req.fields.espe1_1 && req.fields.espe2_1) {
              var carac;
              var descr;
              for (var i = 0 in obj) {
                if (req.fields.video_1 && req.fields.video_2) {
                  if (cont >= 9 + 1) {
                    if (cont % 2 == 0) {
                      carac = (obj[i])
                      contento++;
                    } else if (cont % 2 == 1) {
                      descr = obj[i]
                      contento++;
                    }
                    if (contento == 2) {
                      update.Especificacion.push({ caracteristica: carac, descripcion: descr })
                      contento = 0;
                    }
                  }

                } else {

                  if (cont >= 7 + 1) {
                    if (cont % 2 == 0) {
                      carac = (obj[i])
                      contento++;
                    } else if (cont % 2 == 1) {
                      descr = obj[i]
                      contento++;
                    }
                    if (contento == 2) {
                      update.Especificacion.push({ caracteristica: carac, descripcion: descr })
                      contento = 0;
                    }
                  }

                }
                console.log(cont);

                cont++;
              }


            } else {
              console.log("No se agrego espeficicaciones");
              update.Especificacion = undefined;

            }

            if (req.fields.video_1 && req.fields.video_2) {
              update.Nombre = req.fields.Nombre;
              update.video.video_1 = req.fields.video_1;
              update.video.video_2 = req.fields.video_2;
              update.video.estado = true;

            } else {
              update.Nombre = producto_X.Nombre;
              update.video.video_1 = producto_X.video.video_1;
              update.video.video_2 = producto_X.video.video_2;
              update.video.estado = true;
            }




            update.Descripcion = req.fields.Descripcion;
            update.Nombre = req.fields.Nombre;

            console.log("Mis UPDATE:" + update);




            Producto.findByIdAndUpdate(productId, update, (err, productUpdated) => {
              if (err) res.status(500).send({ message: `Error al actualizar el producto: ${err}` });

              res.status(200).send({ product: productUpdated });
            })
          })



      } else {

        var obj = req.fields;
        var cont = 0;

        var EspeJoder = {}
        var contento = 0;


        console.log("Verga we:" + req.fields.video_1 && req.fields.video_2);

        if (req.fields.espe1_1 && req.fields.espe2_1) {
          var carac;
          var descr;
          for (var i = 0 in obj) {
            if (req.fields.video_1 && req.fields.video_2) {
              if (cont >= 9 + 1) {
                if (cont % 2 == 0) {
                  carac = (obj[i])
                  contento++;
                } else if (cont % 2 == 1) {
                  descr = obj[i]
                  contento++;
                }
                if (contento == 2) {
                  update.Especificacion.push({ caracteristica: carac, descripcion: descr })
                  contento = 0;
                }
              }

            } else {

              if (cont >= 7 + 1) {
                if (cont % 2 == 0) {
                  carac = (obj[i])
                  contento++;
                } else if (cont % 2 == 1) {
                  descr = obj[i]
                  contento++;
                }
                if (contento == 2) {
                  update.Especificacion.push({ caracteristica: carac, descripcion: descr })
                  contento = 0;
                }
              }

            }
            console.log(cont);

            cont++;
          }


        } else {
          console.log("No se agrego espeficicaciones");
          update.Especificacion = undefined;

        }

        if (req.fields.video_1 && req.fields.video_2) {
          update.Nombre = req.fields.Nombre;
          update.video.video_1 = req.fields.video_1;
          update.video.video_2 = req.fields.video_2;
          update.video.estado = true;

        } else {
          update.Nombre = producto_X.Nombre;
          update.video.video_1 = producto_X.video.video_1;
          update.video.video_2 = producto_X.video.video_2;
          update.video.estado = true;
        }




        update.Descripcion = req.fields.Descripcion;
        update.Nombre = req.fields.Nombre;
        console.log(update);




        Producto.findByIdAndUpdate(productId, update, (err, productUpdated) => {
          if (err) res.status(500).send({ message: `Error al actualizar el producto: ${err}` });

          res.status(200).send({ product: productUpdated });
        })

      }

    }
  });

});


api.delete('/GetProductos/:productoId', (req, res) => {
  console.log(req.params.productoId)
  let productoId = req.params.productoId;
  Producto.findById(productoId, (err, pro) => {
    if (err) res.status(500).send({ message: `Error al borrar el producto: ${err}` });
    pro.remove(err => {
      if (err) res.status(500).send({ message: `Error al borrar el producto: ${err}` });

      client.deleteMultiple([
        "/" + pro.Url_imagen_1.split('/').pop(),
        "/" + pro.Url_imagen_2.split('/').pop(),
        "/" + pro.Url_imagen_3.split('/').pop(),
        "/" + pro.Url_imagen_4.split('/').pop(),
        "/" + pro.Url_imagen_5.split('/').pop()], function (err, res) {
          if (err) console.log(err)
          console.log(res);
        });
      res.status(200).send({ message: 'El producto ha sido eliminado' });
    })
  });
});


api.delete('/product/:noticiaId', ProductCtrl.deleteProduct);
api.post('/signup', userCtrl.signUp);
api.post('/signIn', userCtrl.autentificacionUser);
api.get('/private', auth, (req, res) => {
  res.status(200).send({ message: 'Tienes acceso' });
});


api.put('/product/:productId', (req, res) => {
  let productId = req.params.productId;
  let update = req.fields;
  console.log(req.fields)
  Noticias.findByIdAndUpdate(productId, update, (err, productUpdated) => {
    if (err) res.status(500).send({ message: `Error al actualizar el producto: ${err}` });
    let productId = req.params.productId;
    Noticias.findById(productId, (err, Noticia) => {
      if (err) {
        console.log(`Error al realizar la peticion: ${err}`)
      } else if (!Noticia) {
        console.log(`El producto no existe`)
      } else {
        console.log(Noticia)
      }
    });
    res.status(200).send({ product: productUpdated });
  })
});




module.exports = api;
