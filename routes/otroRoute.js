const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
//importando el schema de usuarios
const UsuarioM = require('../models/usuario');
const ProductoM = require('../models/producto');

//default options
// middelware importante
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {

    let { tipo } = req.params;
    let { id } = req.params;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json('ningun archivo a sido subido');
    }

    // validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json('los tipos permitidos son :' + tiposValidos.join(','));
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    // este nombre de archivo es el nombre de el input
    let { archivo } = req.files;

    //vamos a separar nuestro archivo por el punto para obtener el extension
    let nombreCortado = archivo.name.split('.');
    // con esto obtenemos la extension de nuestro archivo que queremos subir
    let extension = nombreCortado[nombreCortado.length - 1];

    //extensiones permitidas
    let extensionesValidas = ['png', 'png', 'gif', 'jpeg', 'jpg'];

    if (extensionesValidas.lastIndexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            error: 'las extensiones permitidas son ' + extensionesValidas.join(','),
            ext: 'lo que mandaste es es :' + extension
        })
    }

    // cambiar el nombre de archivo

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`
    // la direcciones sera donde nuestro archivo se va a subir
    //la variable tipo hace referencia a la carpeta donde se subira nuestro nuevo arhivo 

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        // la imagen ya se subio 

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else if (tipo == 'productos') {
            imagenProducto(id, res, nombreArchivo)
        }

    });
})
// se esta mandando el nombre de archivo por que no funcionada, ppero con ese cambio si funciona
const imagenUsuario = async (id, res, nombreArchivo) => {
    try {
        const usuarioDB = await UsuarioM.findById(id);

        if (!usuarioDB) {
            console.log('nombre de archivo :' + nombreArchivo);
            borraArchivo(nombreArchivo, 'usuarios')
            res.status(400).json({ error: 'El usuario no existe' });
        }

        try {
            // con esta validacion hacemos que cuando se actualice no se cree otro archivo, sino que se reemplaze, eliminando el anterior
            // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${usuarioDB.img}`);
            // console.log('el path de la imagen es :' + pathImagen)
            // if (fs.existsSync(pathImagen)) {
            //     fs.unlinkSync(pathImagen)
            // }
            borraArchivo(usuarioDB.img, 'usuarios');

            const UserUpdated = await UsuarioM.findByIdAndUpdate(id, { img: nombreArchivo })
            return res.json({
                ok: true,
                UserUpdated,
                img: nombreArchivo
            });
        } catch (error) {
            res.json(error);
        }

    } catch (error) {
        res.status(400).json({ error: 'el usuario no existe' });

        borraArchivo(nombreArchivo, 'usuarios')
    }

}
const imagenProducto = async (id, res, nombreArchivo) => {
    try {
        const productoDB = await ProductoM.findById(id);

        if (!productoDB) {
            console.log('nombre de archivo :' + nombreArchivo);
            borraArchivo(nombreArchivo, 'productos')
            res.status(400).json({ error: 'El producto no existe' });
        }

        try {
            // con esta validacion hacemos que cuando se actualice no se cree otro archivo, sino que se reemplaze, eliminando el anterior
            // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${productoDB.img}`);
            // console.log('el path de la imagen es :' + pathImagen)
            // if (fs.existsSync(pathImagen)) {
            //     fs.unlinkSync(pathImagen)
            // }
            borraArchivo(productoDB.img, 'productos');

            const productUpdated = await ProductoM.findByIdAndUpdate(id, { img: nombreArchivo })
            return res.json({
                ok: true,
                productUpdated,
                img: nombreArchivo
            });
        } catch (error) {
            res.json(error);
        }

    } catch (error) {
        res.status(400).json({ error: 'el producto no existe' });

        borraArchivo(nombreArchivo, 'productos')
    }

}

const borraArchivo = (nombreImagen, tipo) => {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    console.log('el path de la imagen es :' + pathImagen)
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    } else {
        console.log('hubo un error')
    }
}
module.exports = app;