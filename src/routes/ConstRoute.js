const express = require('express');
const router = express.Router();
const ConstController = require('../controllers/ConstController');

module.exports = (app) => {
    app.use('/const', router);
};

router.get('/', ConstController.getTableList);
router.get('/compareTables', ConstController.compareTableList);
router.post('/list', ConstController.getTableList);

