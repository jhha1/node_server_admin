const ResponseUtil = require('../utils/response-util');
const ConstService = require('../services/ConstService');

exports.getCategoryList = async (req, res, cb) => {
    try {
        let constCategoryList = await ConstService.getConstCategoryList();

        return res.render('const', {
            serverEnv: ENV,
            categoryList: ResponseUtil.toJson(constCategoryList)
        });

    } catch (err) {
        return res.status(500).json(err);
    }
}

exports.getTableList = async (req, res, cb) => {
    try {
        let constTableList = await ConstService.getConstTableList();

        return res.json(ResponseUtil.toJson(constTableList));

    } catch (err) {
        return res.status(500).json(err);
    }
}

exports.compareTableList = async (req, res, cb) => {
    //const { tableNameList } = req.body;

    try {
        let constTableList = await ConstService.compareTableList();

        return res.json(ResponseUtil.toJson(constTableList));
    } catch (err) {
        return res.status(500).json(err);
    }
}

