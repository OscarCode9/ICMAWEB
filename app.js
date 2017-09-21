'use strict'

const express = require('express')
const hbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
const api = require('./rutas');
const auth = require('./middlewares/auth');
const formidable = require('express-formidable')
const Noticias = require('./models/product');
var metho = require('method-override');
var session = require('express-session');
const nodemailer = require('nodemailer');
const Producto = require('./models/productos');
const Proyecto = require('./models/proyectos');
const aws = require('aws-sdk');
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-west-2';

app.use(express.static('public'));

app.use(formidable({
    encoding: 'utf-8',
    multiples: true // esta almacena archivos
}))


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.engine('.hbs', hbs({
    defaultLayout: 'default',
    extname: '.hbs'
}))
app.use(metho("_method"));
app.set('view engine', '.hbs')

app.use('/api', api);


app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/proyecto/:id', (req, res)=>{
    let proyectoID = req.params.id;
    Proyecto.findById(proyectoID, (err, Proyecto) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!Proyecto) {
            return res.status(404).send({ message: `El producto no existe` })
        } else {
            Producto.find({}, (err, productos) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!productos) {
            return res.status(404).send({ message: `No existen` })
        } else {
            res.render('ProyectoIndex', { productos, Proyecto, layout: false });
            
        }
    })
            
        }
    });
    
});


app.get('/admin', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/Administradores');

    } else {
        res.render('admin', { layout: false });
    }

});

app.get('/galeria', (req, res, err) => {

    Producto.find({}, (err, productos) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!productos) {
            return res.status(404).send({ message: `No existen` })
        } else {
            res.render('galeria', { productos, title: "ICMA | Galeria", uno: "", dos: "", tres: "", cuatro: "select", cinco: "" });
        }
    })
});
app.post('/cerrarsesion', (req, res, err) => {
    req.session.user_id = null;
    res.status(200).send({ message: `Sesion cerrada` })
});

app.get('/servicios', (req, res, err) => {
    Producto.find({}, (err, productos) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!productos) {
            return res.status(404).send({ message: `No existen` })
        } else {
            res.render('servicios', { productos, title: "ICMA | Servicios", uno: "", dos: "select", tres: "", cuatro: "", cinco: "" });
        }
    })
});
app.get('/productos', (req, res, err) => {

    Producto.find({}, (err, pro) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!pro) {
            return res.status(404).send({ message: `No existen` })
        } else {
            res.render('productos', { productos: pro,
                 nom: { nom: pro[0].Nombre, 
                     des: pro[0].Descripcion }
                     , title: "ICMA | Productos", uno: "", dos: "",
                      tres: "select", cuatro: "", cinco: "", layout:false });
        }
    })
});
app.get('/productos/:IdPro', (req, res, err) => {
    var productId = req.params.IdPro;
    Producto.findById(productId, (err, Pro) => {
        console.log(Pro);
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!Pro) {
            return res.status(404).send({ message: `El producto no existe` })
        } else {
            Producto.find({}, (err, pro) => {
                if (err) {
                    return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
                } else if (!pro) {
                    return res.status(404).send({ message: `No existen` })
                } else {
                    res.render('ProID', {
                        helpers: {
                            Frame: function () {
                                return Pro.video.video_1
                            },
                            Freme2: function () {
                                return Pro.video.video_2
                            }
                        },
                        
                        proValue: true,
                        productos: pro,
                        nom: { nom: pro[0].Nombre, des: pro[0].Descripcion }, uno: "",
                        dos: "", tres: "select", cuatro: "", cinco: "",
                        Pro,
                        title: "Noticia | " + Pro.Nombre,
                        idPro: true,
                        contact: true
                    });
                }
            })

        }
    });


});


app.get('/contacto', (req, res, err) => {
    Producto.find({}, (err, productos) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!productos) {
            return res.status(404).send({ message: `No existen` })
        } else {
            res.render('contacto', { productos, title: "ICMA | Contacto", uno: "", dos: "", tres: "", cuatro: "", cinco: "select" });
        }
    })
})
app.post('/contacto', (req, res, err) => {
    console.log(req.fields);
    let transporter = nodemailer.createTransport({
        host: 'p3plcpnl0808.prod.phx3.secureserver.net',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: 'oscar.martinez@icma-ingenieria.com',
            pass: 'Omartinez02@'
        }
    });
    
    let mailOptions = {
        from: "'"+req.fields.name+"' <" + req.fields.email + ">", // sender address
        to: "francisco.salas@icma-ingenieria.com", // list of receivers
        subject: 'CLIENTE COTIZACÓN', // Subject line
        text: req.fields.mensaje
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
            res.status(404).send({enviado:false})
        }
        res.status(200).send({ enviado: true });
    });
    
   
});
app.post('/cotizacion', (req, res, err)=>{
    console.log(req.fields);
     let transporter = nodemailer.createTransport({
        host: 'p3plcpnl0808.prod.phx3.secureserver.net',
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: {
            user: 'oscar.martinez@icma-ingenieria.com',
            pass: 'Omartinez02@'
        }
    });
    

    let mailOptions = {
        from: "'"+req.fields.nombre+"' <" + req.fields.email + ">", // sender address
        to: "francisco.salas@icma-ingenieria.com", // list of receivers
        subject: 'CLIENTE COTIZACÓN', // Subject line
        text: req.fields.requerim
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
            res.status(404).send({enviado:false})
        }
        res.status(200).send({ enviado: "Tu mensaje fue enviado exitosamente" });
    });
});


app.get('/noticia/:IdNoticia', (req, res, err) => {
    let productId = req.params.IdNoticia;
    Noticias.findById(productId, (err, Noticia) => {
        if (err) {
            return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
        } else if (!Noticia) {
            return res.status(404).send({ message: `El producto no existe` })
        } else {
             Producto.find({}, (err, productos) => {
                if (err) {
                    return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
                } else if (!productos) {
                    return res.status(404).send({ message: `No existen` })
                } else {
                    console.log(Noticia.Estado);
                    res.render('noticia', {productos,imageChida:Noticia.Estado, Noticia, title: "Noticia | " + Noticia.Titulo, layout: false });
                }
                
            })
           
        }
    });
});
app.get('/Administradores', (req, res, err) => {
    console.log(req.session.user_id);
    if (req.session.user_id) {
        Noticias.find({}, (err, noticias) => {
            if (err) {
                return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })

            } else if (!noticias) {
                return res.status(404).send({ message: `No existen` })
            } else {

                noticias.forEach(function (element) {
                    console.log(element + "******\n")
                    var myStrin = '' + element.Contenido;
                    myStrin = myStrin.slice(0, 50);
                    element.Contenido = myStrin + '...';
                }, this);
                res.render('admistradores', { noticias, layout: false });
            }
        })

    } else {
        res.redirect('/admin');
    }
});

app.get('/', (req, res, err) => {
    Noticias.find({}, (e, noticias) => {
        noticias.forEach(function (element) {
            var myStrin = '' + element.Contenido;
            myStrin = myStrin.slice(0, 500);
            element.Contenido = myStrin + '...';
        }, this);
        if (e) {
            console.log("Error: " + e);
        } else if (!noticias) {
            console.log("Error, el archivo no existe")

        } else {
            Producto.find({}, (err, productos) => {
                if (err) {
                    return res.status(500).send({ message: `Error al realizar la peticion: ${err}` })
                } else if (!productos) {
                    return res.status(404).send({ message: `No existen` })
                } else {
                    Proyecto.find({}, (e, proyectos) => {
                        proyectos.forEach(function (element) {
                            var myStrin = '' + element.Parrafo_1;
                            myStrin = myStrin.slice(0, 500);
                            element.Parrafo_1 = myStrin + '...';
                        }, this);
                        if (e) {
                            
                            console.log("Error: " + e);
                        } else if (!proyectos) {
                            console.log("Error, el archivo no existe")

                        } else {
                            res.render('index', {proyectos, productos, noticias, title: "ICMA", uno: "select", dos: "", tres: "", cuatro: "", cinco: "" });
                        }

                    })

                }
            })

        }

    })
});

app.get('/account', (req, res) => res.render('ejm',{layout: false}));
aws.config.region = 'eu-west-1';
app.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3();
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };
  
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if(err){
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      };
      res.write(JSON.stringify(returnData));
      res.end();
    });
  });

module.exports = app;