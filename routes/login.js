//config 
const { SEED, CLIENT_ID } = require('../config/config');

const { Router } = require('express')
const router = Router();
const { verificateToken } = require('../middlewares/jsonVerification')
const jwt = require('jsonwebtoken');

// =============================
// importacion de la libreria para compararla con google

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
// =============================


//dbModel
const UsuarioModel = require('../models/usuariomodel');
//bcrypts
const bcrypt = require('bcryptjs')


// =============================
// Renuevo token
// =============================
router.get('/renuevaToken', verificateToken, (req, res) => {
    const token = jwt.sign({ usuario: req.usuario }, SEED, {
        expiresIn: 14400
    })
    return res.status(200).json({
        ok: true,
        token
    })
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userdb = await UsuarioModel.findOne({ email });
    if (userdb) {
        // res.status(200).json(userdb);
        console.log(password, userdb.password);
        if (!bcrypt.compareSync(password, userdb.password)) {
            return res.status(400).json({ err: true, message: 'credenciales incorrectas' })
        } else {
            //return res.status(400).json({ err: true, message: 'Bienvenido prro' })
            //crear token
            userdb.password = ':)';
            const token = jwt.sign({ usuario: userdb }, SEED, {
                expiresIn: 14400
            })
            return res.status(200).json({
                ok: true,
                token,
                userdb,
                id: userdb._id,
                menu: obtenerMenu(userdb.role)
            })
        }


    } else if (!userdb) {
        return res.status(400).json({ err: true, message: 'credenciales incorrectas' })
    }
});

// =============================
// ruta para entrar con el google
// =============================

router.post('/google', async (req, res) => {

    let { token } = req.body;

    if (!token) {
        res.status(400).json('no se proporcino token')
    } else {
        // console.log('token recibido : ' + token);

        const googleUser = await verify(token)
            .catch(e => {
                res.json({
                    ok: false,
                    mensaje: 'hubo un error en el authenticacion'
                })
            });
        // res.json({
        //     ok: true,
        //     googleUser
        // })
        // try {
        const user = await UsuarioModel.findOne({ email: googleUser.email });
        console.log(googleUser)
        if (user) {
            if (user.google === false) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'debe de usar su auteticacion normal'
                });
            } else {

                user.password = ':)'
                const token = jwt.sign({ user }, SEED, {
                    expiresIn: 14400
                })
                return res.status(200).json({
                    ok: true,
                    userdb: user,
                    token,
                    id: user._id,
                    menu: obtenerMenu(userdb.role)
                })
            }
        } else {
            // el usuario no existe tenemos que crearlo
            const newUser = new UsuarioModel({
                nombre: googleUser.nombre,
                img: googleUser.img,
                email: googleUser.email,
                google: true,
                password: ':)'
            });

            const nuevo_user = await newUser.save();
            return res.status(200).json({
                err: true,
                message: 'usuario creado',
                nuevo_user,
                menu: obtenerMenu(nuevo_user.role)
            })

        }
        // } catch (error) {
        //     return res.status(400).json({
        //         err: false,
        //         message: 'hubo un error',

        //     })
        // }

    }



})


async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // console.log(payload.name)
    // console.log(payload.email)
    // console.log(payload.picture)
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    }
}



// =============================
// fin de google auth
// =============================

function obtenerMenu(Role) {

    let menu = [
        {
            titulo: "Principal",
            icono: "mdi mdi-gauge",
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/grafica1' },
                { titulo: 'RXJS', url: '/rxjs' },
            ]
        },
        {
            titulo: "Mantenimiento",
            icono: "mdi mdi-folder-lock-open",
            submenu: [
                /* { titulo: 'Usuarios', url: '/usuarios' }, */
                { titulo: 'Hosptiales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ]
        },


    ];

    if (Role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({
            titulo: 'Usuarios', url: '/usuarios'
        });
    }

    return menu;


}

module.exports = router;