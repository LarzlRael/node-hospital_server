const { Router } = require('express')

const { verificateToken, verificaRol, verificaUnoMismo } = require('../middlewares/jsonVerification')

const router = Router();
//dbModel
const UsuarioModel = require('../models/usuariomodel');
//bcrypts

// =============================
// Metodo de indice xD
// =============================
const bcrypt = require('bcryptjs')
router.get('/user', (req, res) => {
    res.status(200).json('hola desde el enrutador de user :D')
})

// =============================
// Metodo para poder ver todos los usuarios
// =============================
router.get('/users', verificateToken, async (req, res) => {

    // let desde = req.body.desde || 0;
    // desde = Number(desde);

    // try {
    //     const allUsers = await UsuarioModel.find({}, 'nombre email img role google')
    //         .skip(desde)
    //         .limit(5);
    //     const count = await UsuarioModel.count();
    //     res.status(200).json({ users: allUsers, total: count, ok: true })
    // } catch (error) {
    //     res.status(500).json({ error });
    // }
    var desde = req.query.desde || 0;
    desde = Number(desde);

    UsuarioModel.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                UsuarioModel.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        users: usuarios,
                        total: conteo
                    });

                })




            });
})
// ========================
// Añadir un nuevo usuario
// ========================
router.post('/add-user', async (req, res) => {
    const { nombre, img, password, email, role } = req.body;
    const newUser = {
        nombre,
        img,
        //encriptando la contraseña
        password: bcrypt.hashSync(password, 10),
        email,
        role
    }

    const newU = new UsuarioModel(newUser);
    try {
        await newU.save();
        res.status(200).json({ status: 'ok', message: 'User added successfully' })
    } catch (error) {
        res.status(500).json({ err: true, error })
    }

})

// ========================
// Actualizar usuario
// ========================

router.put('/edit/:id', [verificateToken, verificaUnoMismo], async (req, res) => {
    const { id } = req.params;
    const usuario = await UsuarioModel.findById(id);
    if (usuario) {

        const { nombre, img, email, role } = req.body;

        usuario.nombre = nombre;
        usuario.img = img;
        usuario.email = email;
        usuario.role = role;
        console.log(usuario)
        try {
            const userUpdated = await usuario.save();
            res.status(200).json({ ok: true, message: 'Usuario actualizado', usuario: userUpdated })
        } catch (error) {
            res.status(400).json({
                ok: false,
                err: 'hubo un error en el guardado',
                error
            })
        }
    } else {
        res.status(400).json({ message: 'no se encontro el usuario' });

    }

    // var id = req.params.id;
    // var body = req.body;

    // UsuarioModel.findById(id, (err, usuario) => {


    //     if (err) {
    //         return res.status(500).json({
    //             ok: false,
    //             mensaje: 'Error al buscar usuario',
    //             errors: err
    //         });
    //     }

    //     if (!usuario) {
    //         return res.status(400).json({
    //             ok: false,
    //             mensaje: 'El usuario con el id ' + id + ' no existe',
    //             errors: { message: 'No existe un usuario con ese ID' }
    //         });
    //     }


    //     usuario.nombre = body.nombre;
    //     usuario.email = body.email;
    //     usuario.role = body.role;

    //     usuario.save((err, userUpdated) => {

    //         if (err) {
    //             return res.status(400).json({
    //                 ok: false,
    //                 mensaje: 'Error al actualizar usuario',
    //                 errors: err
    //             });
    //         }

    //         usuarioGuardado.password = ':)';

    //         res.status(200).json({
    //             ok: true,
    //             usuario: userUpdated
    //         });

    //     });

    // });


})

// =============================
// Eliminar un registro
// =============================

router.delete('/:id', [verificateToken, verificaRol], async (req, res) => {
    const { id } = req.params;
    try {
        const user = await UsuarioModel.findByIdAndDelete(id);
        if (!user) {
            res.status(200).json({ err: false, message: 'Usuario eliminado correctamente (fisicamente)' })
        } else {
            res.status(200).json({ err: false, message: 'no existe ese usuario' })
        }

    } catch (error) {
        res.status(400).json({ err: true, message: error })
    }

})

module.exports = router;