const ResponseUtil = require('../utils/response-util');
const ConstService = require('../services/ConstService');

exports.getTableList = async (req, res, cb) => {
    try {
        let constTableList = await ConstService.getConstTableList();

       // return res.json(ResponseUtil.toJson(constTableList));

        return res.render('const', {
            serverEnv: ENV,
            tableList: ResponseUtil.toJson(constTableList)
        });

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

