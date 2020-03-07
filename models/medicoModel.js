const { Schema, model } = require('mongoose');

const medicoSchema = new Schema({
    nombre: {
        type: String, required: [true, 'El nombre es necesario'],
    },
    img: {
        type: String, required: false, default: 'no se proporciono imagen'
    },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    hospital: {
        type: Schema.Types.ObjectId, ref: 'Hospital', required: [
            true, 'El id del hospital es necesario'
        ]
    },
});

module.exports = model('Medicos', medicoSchema);