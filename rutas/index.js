const express = require('express')
const ProductCtrl = require('../controles/product');
const api = express.Router();
const auth = require('../middlewares/auth');
const userCtrl = require('../controles/user');
const Noticias = require('../models/product');
const Producto = require('../models/productos');
const Proyecto = require('../models/proyectos');
var fs = require('fs.extra');
var fss = require('fs');

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

api.get('/product', ProductCtrl.getProducts)
api.get('/product/:productId', ProductCtrl.getProduct)

api.post('/product', ProductCtrl.saveProduct)

api.post('/NewProduct', (req, res) => {

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
  fs.copy(req.files.archivo_1.path, "public/imagenes/productos/" + producto._id + "_1" + "." + exten_1);
  fs.copy(req.files.archivo_2.path, "public/imagenes/productos/" + producto._id + "_2" + "." + exten_2);
  fs.copy(req.files.archivo_3.path, "public/imagenes/productos/" + producto._id + "_3" + "." + exten_3);
  fs.copy(req.files.archivo_4.path, "public/imagenes/productos/" + producto._id + "_4" + "." + exten_4);
  fs.copy(req.files.archivo_5.path, "public/imagenes/productos/" + producto._id + "_5" + "." + exten_5);


  //Asigna el nombre de la base de datos y guardar ruta de la base de datos. 
  producto.Nombre = req.fields.Nombre;

  producto.Descripcion = req.fields.Descripcion;
  producto.Url_imagen_1 = "imagenes/productos/" + producto._id + "_1" + "." + exten_1;
  producto.Url_imagen_2 = "imagenes/productos/" + producto._id + "_2" + "." + exten_2;
  producto.Url_imagen_3 = "imagenes/productos/" + producto._id + "_3" + "." + exten_3;
  producto.Url_imagen_4 = "imagenes/productos/" + producto._id + "_4" + "." + exten_4;
  producto.Url_imagen_5 = "imagenes/productos/" + producto._id + "_5" + "." + exten_5;


  // si se subieron videos guardar codigo en la base de datos  y asignar el estado de los videos como true en caso contrario guardar un estring basio y guarda el estado como false
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
    res.status(200).send({ datos: producStored })
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

      if(Producto.Especificacion == null){
       numero_chido=0;
      }else{
         numero_chido = Number(Producto.Especificacion.length);
      }




      
      res.render('actualizarPro', { Producto, sin_fotos, numero_chido, layout: false });
    }
  });

})
api.put('/GetProductos/:productoId', (req, res) => {
  let productId = req.params.productoId;
  console.log(req.fields);


  Producto.findById(productId, (err, producto_X) => {
    if (err) {
      return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
    } else if (!producto_X) {
      return res.status(404).send({ message: `El producto no existe` })
    } else {

      let update = {};
       if (req.fields.espe1_1 && req.fields.espe2_1){
         update.Especificacion = [];
       }
      

      update.video = {
        video_2: "",
        video_1: "",
        estado: false

      }
      let urls = [];

      urls.push("public/" + producto_X.Url_imagen_1);
      urls.push("public/" + producto_X.Url_imagen_2);
      urls.push("public/" + producto_X.Url_imagen_3);
      urls.push("public/" + producto_X.Url_imagen_4);
      urls.push("public/" + producto_X.Url_imagen_5);

    

      if (req.files.archivo_1 && req.files.archivo_2) {
        urls.forEach(function (url) {
          fss.stat(url, function (err, stats) {
            console.log(stats);
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
        var exten5 = req.files.archivo_5.name.split('.').pop();
        var num = Math.floor((Math.random() * 1000) + 1);

        var id = req.fields._id;
        var dire1 = "imagenes/productos/" + id + num + "_1" + "." + exten1;
        var dire2 = "imagenes/productos/" + id + num + "_2" + "." + exten2;
        var dire3 = "imagenes/productos/" + id + num + "_3" + "." + exten3;
        var dire4 = "imagenes/productos/" + id + num + "_4" + "." + exten4;
        var dire5 = "imagenes/productos/" + id + num + "_5" + "." + exten5;

        fs.copy(req.files.archivo_1.path, 'public/' + dire1, err => {
        })

        fs.copy(req.files.archivo_2.path, 'public/' + dire2, err => {
          if (err) return console.error(err)
          console.log('success!')
        })

        fs.copy(req.files.archivo_3.path, 'public/' + dire3, err => {
          if (err) return console.error(err)
          console.log('success!')
        })

        fs.copy(req.files.archivo_4.path, 'public/' + dire4, err => {
          if (err) return console.error(err)
          console.log('success!')
        })

        fs.copy(req.files.archivo_5.path, 'public/' + dire5, err => {
          if (err) return console.error(err)
          console.log('success!')
        })

        update.Url_imagen_1 = dire1;
        update.Url_imagen_2 = dire2;
        update.Url_imagen_3 = dire3;
        update.Url_imagen_4 = dire4;
        update.Url_imagen_5 = dire5;

      }



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
            if (cont >= 9+1) {
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

            if (cont >= 7+1) {
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
        update.Especificacion= [];

      }
      if (req.fields.video_1 && req.fields.video_2) {
        update.Nombre = req.fields.Nombre;
        
        update.video.video_1 = req.fields.video_1;
        update.video.video_2 = req.fields.video_2;
        update.video.estado = true;

      }


      

      update.Descripcion = req.fields.Descripcion;
      update.Nombre = req.fields.Nombre;




      Producto.findByIdAndUpdate(productId, update, (err, productUpdated) => {
        if (err) res.status(500).send({ message: `Error al actualizar el producto: ${err}` });

        res.status(200).send({ product: productUpdated });
      })

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
