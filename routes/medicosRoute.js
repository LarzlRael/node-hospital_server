const { Router } = require('express')

const { verificateToken } = require('../middlewares/jsonVerification')

const router = Router();
//dbModel   
const medicoModel = require('../models/medicoModel');

// =============================
// Metodo de indice xD
// =============================
router.get('/', (req, res) => {
    res.status(200).json('hola desde el enrutador de medico :D')
})

// =====================================
// Metodo para poder ver todos los medicos
// =====================================
router.get('/medicos', verificateToken, async (req, res) => {
    let desde = req.body.desde || 0;
    desde = Number(desde);
    try {
        const medicos = await medicoModel.find()
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .skip(desde)
            .limit(5);
        const count = await medicoModel.count();
        res.status(200).json({ medicos, ok: true, total: count })
    } catch (errors) {
        res.status(500).json({ error: errors });
    }
})
// ========================
// Añadir un nuevo hospital
// ========================
router.post('/add-medico', verificateToken, async (req, res) => {
    const { nombre } = req.body;
    const id = req.usuario._id;
    const { hospital } = req.body;
    const newM = {
        nombre,
        hospital,
        usuario: id
    }

    const newMedico = new medicoModel(newM);
    try {
        await newMedico.save();
        res.status(200).json({
            status: 'ok',
            message: 'Medico added successfully',
            newMedico
        })
    } catch (error) {
        res.status(500).json({ err: true, error })
    }

})

// ========================
// Actualizar usuario
// ========================

router.put('/edit/:id', verificateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await medicoModel.findById(id);

    } catch (error) {
        res.status(400).json({ err: error, message: 'no se encontro ninguna coicidencia' })
    }

    const { nombre } = req.body;
    const { hospital } = req.body;
    const usuario = req.usuario._id;
    const newMedico = {
        nombre,
        usuario,
        hospital
    }
    try {
        await medicoModel.findOneAndUpdate(id, newMedico, { new: true, runValidators: true });
        res.status(200).json({ message: 'Medico actualizado', newMedico })
    } catch (error) {
        res.status(400).json({ err: true, message: error })
    }
})

// =============================
// Eliminar un registro
// =============================

router.delete('/:id', verificateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const user = await medicoModel.findByIdAndDelete(id);
        if (!user) {
            res.status(200).json({ err: false, message: 'medico eliminado correctamente (fisicamente)' })
        } else {
            res.status(200).json({ err: false, message: 'no existe ese medico' })
        }

    } catch (error) {
        res.status(400).json({ err: true, message: error })
    }

});

// =============================
// obtener un medico
// =============================

router.get('/:id', verificateToken, async (req, res) => {
    let { id } = req.params;

    const medico = await medicoModel.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec();

    if (medico) {
        return res.status(200).json(medico);
    } else {
        return res.status(400).json({ error: 'no se encontro el medico' })
    }

})
module.exports = router;