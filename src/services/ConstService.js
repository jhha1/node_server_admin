const db = require('../database/db');
const UserQueries = require('../queries/user-query');
const googleApi = require('../database/google/googleApi');
const s3 = require('../database/aws/s3').s3;
const zip = require('../utils/zip');

exports.compareTableList =  async function() {
    try {
        let sheetId = CONFIG["google"]["constSheetIds"]["item"];
        let GoogleSheetObj = new googleApi.GoogleSheet(sheetId);
        let googleSheetTableList = await GoogleSheetObj.readSheetAll();

        let s3Obj = new s3();
        let folderPath = CONFIG["aws"]["s3"]["folderPath"]["const"];
        let fileName = 'CONST_DEV_2023-05-04_10:08:18.zip';
        let fileNameList = [fileName];
        let result = await s3Obj.download(folderPath, fileNameList);
        let unZipData = await zip.unZip(result[fileName]);
        let s3TableList = JSON.parse(unZipData.toString('utf-8'));

        /*
        let changedTableList = [];
        for (let s3Table of s3TableList) {
            let s3Header = s3Table.values[0];
            let rows = s3Table.values.slice(1, s3Table.values[0].length);

            let found = googleSheetTableList.findIndex((x) => x.sheetName === s3Table.sheetName);
            if (found === -1) {
                // delete table
                changedTableList.push({type:'del', sheetName: s3Table.sheetName, header:s3Header, values:s3Table});
                continue;
            }
            else {
                let googleHeader = googleSheetTableList[found].values[0];

                for (let googleTable of googleSheetTableList[found].values);
            }


            }


            //tableHeaderAndValues.push({sheetName: data.sheetName, header:header, values:values});
        }*/

    }
    catch (err) {
        throw err;
    }
}

exports.getConstTableList = async function(id) {
    try {
/*
        let sheetId = CONFIG["google"]["constSheetIds"]["item"];
        let GoogleSheetObj = new googleApi.GoogleSheet(sheetId);
        let data = await GoogleSheetObj.readSheetAll();

        let zipData = await zip.make(data);

        let folderPath = CONFIG["aws"]["s3"]["folderPath"]["const"];
        let fileName = zip.makeZipFileName();
        let s3Obj = new s3();
        await s3Obj.upload(folderPath, fileName, zipData);
*/
        let s3Obj = new s3();
        let folderPath = CONFIG["aws"]["s3"]["folderPath"]["const"];
        let fileName = 'CONST_DEV_2023-05-04_10:08:18.zip';

        let fileNameList = [fileName];
        let result = await s3Obj.download(folderPath, fileNameList);

        let unZipData = await zip.unZip(result[fileName]);
        let dataArray = JSON.parse(unZipData.toString('utf-8'));

        let tableHeaderAndValues = [];
        for (let data of dataArray) {
            let header = data.values[0];
            let values = data.values.slice(1, data.values[0].length);
            tableHeaderAndValues.push({sheetName: data.sheetName, header:header, values:values});
        }

        console.log(tableHeaderAndValues);

        return tableHeaderAndValues;

        //let rows = await db.runQuery(UserQueries.selectById(id));
        //return rows[0];
    } catch (err) {
        throw err;
    }
}