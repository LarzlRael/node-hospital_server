const { Router } = require('express')
const router = Router();
//db

require('../database/mongodb');
router.get('/', (req, res) => {
    res.status(200).json('hola desde el enrutador :D')
})


module.exports = router;
