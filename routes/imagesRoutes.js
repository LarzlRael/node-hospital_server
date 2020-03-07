const { Router } = require('express')
const router = Router();
const path = require('path');
const fs = require('fs');

// =============================
// rutas para poder ver las imagenes
// =============================


router.get('/:tipo/:img', (req, res) => {

    const { tipo, img } = req.params;

    const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen)
    }
    else {
        // noimage.jpg
        const noimagen = path.resolve(__dirname, `../assets/noimage.jpg`);
        res.sendFile(noimagen);
    }
})


module.exports = router;


// http://localhost:3000/img/usuarios/5e585f6865076f5a647a3dd9-721.png

// http://localhost:3000/usuarios/5e59a23170f4bb2bf2254b95-248.jpg