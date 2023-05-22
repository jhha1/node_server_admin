const ResponseUtil = require('../utils/response-util');
const ConstService = require('../services/ConstService');

exports.getCategoryList = async (req, res, cb) => {
    try {
        let constCategoryList = await ConstService.getConstCategoryList();
        let data = {
            serverEnv: ENV,
            categoryList: ResponseUtil.toJson(constCategoryList)
        };
        return res.render('const', data);

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

exports.upload = async (req, res, cb) => {
    try {
        let result = await ConstService.uploadEc2();

        return res.json(ResponseUtil.toJson(result));
    } catch (err) {
        return res.status(500).json(err);
    }
}

