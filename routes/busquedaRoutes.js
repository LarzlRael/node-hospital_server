const { Router } = require('express')
const router = Router();
//db
const userModel = require('../models/usuariomodel');
const medicoModel = require('../models/medicoModel');
const hospitalModel = require('../models/hospitalModel');
const { verificateToken } = require('../middlewares/jsonVerification')
// =============================
// metodo para buscar por todos los campos
// =============================
router.get('/todo/:busqueda', verificateToken, async (req, res) => {

    let { busqueda } = req.params;
    let regex = new RegExp(busqueda, 'i');

    Promise.all(
        [buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)])
        .then(repuestas => {

            res.status(200).json({
                ok: true,
                hospitales: repuestas[0],
                medicos: repuestas[1],
                usuarios: repuestas[2],
            });
        })

})

// =============================
// Buscar un coleccion especifica
// =============================

router.get('/coleccion/:tabla/:busqueda', async (req, res) => {
    const { tabla, busqueda } = req.params;
    let regex = new RegExp(busqueda, 'i');
    let promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensage: 'no se encontraon coincidencias',
                error: 'error de tabla/coleccion no existe'
            })
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        })
    })

})
// =============================
// metodo para buscar hospitales
// =============================

function buscarHospitales(busqueda, regex) {


    return new Promise((resolve, reject) => {

        hospitalModel.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('error al cargar los hospitales'.err)
                } else {
                    resolve(hospitales)
                }
            });
    })

}
// =============================
// Busqueda para usuarios
// =============================
function buscarUsuarios(busqueda, regex) {


    return new Promise((resolve, reject) => {

        userModel.find()
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar los usuarios'.err)
                } else {
                    resolve(usuarios)
                }
            });
    })


}
function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        medicoModel.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('error al cargar los hospitales'.err)
                } else {
                    resolve(medicos)
                }
            });
    })

};


async function busquedaPorTabla(busqueda, tabla) {
    // userModel
    // medicoModel
    // hospitalModel
    let regex = new RegExp(busqueda, 'i');
    const table = `${tabla}Model`;
    try {
        const busqueda = await table.find({ nombre: regex });
        return busqueda;
    } catch (error) {
        return 'no se encontraron coidencias'
    }
}


module.exports = router;
