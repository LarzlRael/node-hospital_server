var express = require('express');
var app = express();
const multer = require('multer');
var path = require('path');
const uuid = require('uuid/v4')




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let { tipo } = req.params;
        console.log('params ',req.params);
        let { id } = req.params;
        cb(null, path.join(__dirname, (`../uploads/${tipo}`)));
    },
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
})

app.use(multer({
    storage,
    dest: path.join(__dirname, '../uploads/'),
    fileFilter: (req, file, cb) => {
        
        let filetype = /jpeg|jpg|png|gif/;
        let mimetype = filetype.test(file.mimetype);
        let extname = filetype.test(path.extname(file.originalname));
        if (mimetype & extname) {
            return cb(null, true)
        };
        cb('error el archivo tiene que ser una valida')
    }, limits: { fieldSize: 2000000 },

}).single('imagen'))

app.get('/:tipo/:id', (req, res) => {
    console.log(req.file);
    res.send('funciona')
})




module.exports = app;