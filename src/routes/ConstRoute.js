const express = require('express');
const router = express.Router();
const ConstController = require('../controllers/ConstController');

module.exports = (app) => {
    app.use('/const', router);
};

router.get('/', ConstController.getCategoryList);
router.get('/compareTables', ConstController.compareTableList);
router.post('/listTables', ConstController.getTableList);
router.get('/upload', ConstController.upload);

