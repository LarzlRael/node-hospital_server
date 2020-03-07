const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

const { Schema } = require('mongoose')

const usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario'],
    },
    email: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    password: {
        type: String,
        required: [true, 'la contraseña es necesaria']
    },
    img: {
        type: String,
        default:'no se proporciona imagen'
    },
    role: {
        type: String,
        required: true, default:
            'USER_ROLE',
        enum: rolesValidos
    },
    google: { type: Boolean, default: false }

});
usuarioSchema.plugin(uniqueValidator, { message: 'El correo debe ser unico' })

module.exports = mongoose.model('Usuario', usuarioSchema);