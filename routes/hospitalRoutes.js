const { Router } = require('express')

const { verificateToken } = require('../middlewares/jsonVerification')

const router = Router();
//dbModel   
const hospitalModel = require('../models/hospitalModel');

// =============================
// Metodo de indice xD
// =============================
router.get('/', (req, res) => {
    res.status(200).json('hola desde el enrutador de hospital :D')
})

// =============================
// Metodo para poder ver todos los hospitales
// =============================
router.get('/hospitales', verificateToken, async (req, res) => {
    let desde = req.body.desde || 0;
    desde = Number(desde);
    try {
        const Hospital = await hospitalModel.find()
            .populate('usuario', 'nombre email')
            .skip(desde)
            .limit(5);
        const count = await hospitalModel.count();
        res.status(200).json({ Hospital, ok: true, total: count });
    } catch (error) {
        res.status(500).json({ error });
    }
})
// ========================
// Añadir un nuevo hospital
// ========================
router.post('/add-hospital', verificateToken, async (req, res) => {
    const { nombre } = req.body;
    const id = req.usuario._id;
    const newH = {
        nombre,
        usuario: id
    }

    const newHospital = new hospitalModel(newH);
    try {
        await newHospital.save();
        res.status(200).json({ status: 'ok', message: 'Hospital added successfully' })
    } catch (error) {
        res.status(500).json({ err: true, error })
    }

})

// ========================
// Actualizar hospital
// ========================

router.put('/edit/:id', verificateToken, async (req, res) => {
    var id = req.params.id;
    var body = req.body;

    hospitalModel.findById(id, (err, hospital) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }


        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;
        console.log(req.body);
        console.log('\n\nid que se pondra el hospital.usuario ', req.usuario._id)

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });

})
// =============================
// Buscar un hospital por id
// =============================

router.get('/:id', verificateToken, (req, res) => {
    const { id } = req.params;
    hospitalModel.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: {
                        message: 'No existe un hospitalcon ese ID'
                    }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        })
})

// =============================
// metodo para eliminzar un hospital
// =============================

router.delete('/:id', verificateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await hospitalModel.findByIdAndDelete(id);
        return res.status(200).json({
            ok: true,
            mensaje: 'Registro ELiminado',
        });
    } catch (error) {
        return res.status(400).json({
            ok: true,
            err
        });
    }




})
module.exports = router;