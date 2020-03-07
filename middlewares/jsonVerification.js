const { SEED } = require('../config/config');
const jwt = require('jsonwebtoken');
let verificateToken = (req, res, next) => {
    //con esta variable vamos a buscar la cabezera que tiene nuestro token
    let token = req.get('token');
    //esta funcion recibe 3 parametros 
    //1- token
    //2- seed
    //3- callback
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            })
        }
        // en esta parte se crea un req los datos del usuario
        req.usuario = decoded.usuario;

        next();
    })
}


let verificaRol = (req, res, next) => {

    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'no puedes hacer esta operacion'
            }
        })
    }

}

// =============================
// verifica admon o mismo usuario
// =============================


let verificaUnoMismo = (req, res, next) => {

    let usuario = req.usuario;
    let id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        console.log('usuario es el mismo');
        next();
        return;
    } else {
        console.log('usuario diferente');
        return res.status(400).json({
            
            ok: false,
            err: {
                message: 'no eres adminstrador ni es el mismo'
            }
        })
    }

}




module.exports = { verificateToken, verificaRol, verificaUnoMismo };