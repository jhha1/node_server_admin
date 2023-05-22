const db = require('../database/db');
const axios = require('axios');
const googleApi = require('../database/google/googleApi');
const s3 = require('../database/aws/s3').s3;
const zip = require('../utils/zip');

class ConstService {
    constructor() {
        this.s3Obj = new s3();

        this.FOLDER_PATH = CONFIG["const"]["folderPath"];
        this.VERSION_FILE_NAME = CONFIG["const"]["versionFileName"];
        this.CATEGORY_LIST = CONFIG["google"]["constSheetIds"];
    }

    getCategoryList() {
        return this.CATEGORY_LIST;
    }

    async getLatestS3Const() {
        let versionData = await this.s3Obj.download(this.FOLDER_PATH, [this.VERSION_FILE_NAME]);
        let version = JSON.parse(versionData[this.VERSION_FILE_NAME].toString('utf8'));
        let zipFileName = version['version'];
        let zipFile = await this.s3Obj.download(this.FOLDER_PATH, [zipFileName]);
        let unZipFile = await zip.unZip(zipFile[zipFileName]);
        let constArrays = JSON.parse(unZipFile.toString('utf-8'));
        return constArrays;
    }

    async getLatestGoogleConst() {
        let sheetId = CONFIG["google"]["constSheetIds"]["item"];
        let GoogleSheetObj = new googleApi.GoogleSheet(sheetId);
        let googleSheetTableList = await GoogleSheetObj.readSheetAll();
        return googleSheetTableList;
    }

    async uploadEc2(googleSheetList) {
        const data = {
            new_tables: googleSheetList
        };
          
        const options = {
        // 요청 설정
        url: 'http://127.0.0.1:8886/const/refleshTables', // 요청을 보낼 URL
        method: 'POST', // HTTP 메서드
        headers: {
            'Content-Type': 'application/json' // 요청 헤더 설정 (JSON 형식으로 전송할 경우)
        },
        data: JSON.stringify(data) // 데이터를 JSON 문자열로 변환
        };
        
        await axios(options)
        .then((response) => {
            // 응답을 받았을 때의 처리
            console.log(response.data);
        })
        .catch((error) => {
            // 에러 처리
            console.error(error);
        });

        await this.getLatestEc2Const();
    }

    async getLatestEc2Const() {
        const options = {
            // 요청 설정
            url: 'http://127.0.0.1:8886/const/listTables', // 요청을 보낼 URL
            method: 'POST', // HTTP 메서드
            headers: {
                'Content-Type': 'application/json' // 요청 헤더 설정 (JSON 형식으로 전송할 경우)
            },
            data: {}
            };
            
            await axios(options)
            .then((response) => {
                // 응답을 받았을 때의 처리
                console.log(response.data);
            })
            .catch((error) => {
                // 에러 처리
                console.error(error);
            });
    }

    async compareTableList(s3SheetList, googleSheetList) {
        const googleSheetIndexList = this._createIndexList(googleSheetList, 'sheetName');
        const s3SheetIndexList = this._createIndexList(s3SheetList, 'sheetName');

        const changedSheetList = {};
        const addedSheetList = {};
        const deletedSheetList = {};

        for (const s3Sheet of s3SheetList) {
            const sheetName = s3Sheet.sheetName;

            if (!googleSheetIndexList.hasOwnProperty(sheetName)) {
                deletedSheetList[sheetName] = s3Sheet.values;
            }
        }

        for (const googleSheet of googleSheetList) {
            const sheetName = googleSheet.sheetName;

            if (!s3SheetIndexList.hasOwnProperty(sheetName)) {
                addedSheetList[sheetName] = googleSheet.values;
                continue;
            }

            const s3Sheet = s3SheetList[s3SheetIndexList[sheetName]];
            this._checkCellValueChanges(googleSheet.values, s3Sheet.values, sheetName, changedSheetList);
            this._checkDeletedCells(googleSheet.values, s3Sheet.values, sheetName, changedSheetList);
        }

        return {added:addedSheetList, deleted:deletedSheetList, chaged:changedSheetList};
    }

    // googleSheet -> s3
    async uploadToS3() {
        const googleSheetList = await this.getLatestGoogleConst();
        const zipData = await zip.make(googleSheetList);
        const newFileName = zip.makeZipFileName();
        await this.s3Obj.upload(this.FOLDER_PATH, newFileName, zipData);

        const versionData = JSON.stringify({version: newFileName});
        await this.s3Obj.upload(this.FOLDER_PATH, this.VERSION_FILE_NAME, versionData);

        return newFileName;
    }

    _createIndexList(sheetList, key) {
        return sheetList.reduce((obj, sheet, index) => {
            obj[sheet[key]] = index;
            return obj;
        }, {});
    }

    _checkCellValueChanges(googleValues, s3Values, sheetName, changedSheetList) {
        for (let row = 0; row < googleValues.length; row++) {
            const cellList = googleValues[row];
            for (let col = 0; col < cellList.length; col++) {
                const googleCell = cellList[col];
                const s3Cell = s3Values[row][col];
                if (googleCell !== s3Cell) {
                    if (!changedSheetList.hasOwnProperty(sheetName)) {
                        changedSheetList[sheetName] = [];
                    }
                    changedSheetList[sheetName].push({ row, col });
                }
            }
        }
    }

    _checkDeletedCells(googleValues, s3Values, sheetName, changedSheetList) {
        for (let row = 0; row < s3Values.length; row++) {
            const cellList = s3Values[row];
            for (let col = 0; col < cellList.length; col++) {
                const googleCell = googleValues[row][col];
                if (!googleCell) {
                    if (!changedSheetList.hasOwnProperty(sheetName)) {
                        changedSheetList[sheetName] = [];
                    }
                    changedSheetList[sheetName].push({ row, col });
                }
            }
        }
    }
}

exports.compareTableList =  async function() {
    try {
        let ConstServiceObject = new ConstService();
        const s3SheetList = await ConstServiceObject.getLatestS3Const();
        const googleSheetList = await ConstServiceObject.getLatestGoogleConst();
        const results = await ConstServiceObject.compareTableList(s3SheetList, googleSheetList);
        return results;
    }
    catch (err) {
        throw err;
    }
}

exports.getConstCategoryList = async function(id) {
    try {
        let ConstServiceObject = new ConstService();  
        let list = ConstServiceObject.getCategoryList();
        let array = [];
        for (let name in list) {
            array.push([name, list[name]]);
        }
        return array;
    } 
    catch (err) {
        throw err;
    }
}

exports.getConstTableList = async function(id) {
    try {
        let ConstServiceObject = new ConstService();  
        
       // await ConstServiceObject.uploadToS3();
        
        const dataArray = await ConstServiceObject.getLatestS3Const();

        let tableHeaderAndValues = [];
        for (let data of dataArray) {
            let header = data.values[0];
            let values = data.values.slice(1, data.values[0].length);
            tableHeaderAndValues.push({sheetName: data.sheetName, header:header, values:values});
        }

        console.log(tableHeaderAndValues);

        return tableHeaderAndValues;
    } catch (err) {
        throw err;
    }
}

exports.uploadEc2 =  async function() {
    try {
        let ConstServiceObject = new ConstService();
        const googleSheetList = await ConstServiceObject.getLatestGoogleConst();
        const results = await ConstServiceObject.uploadEc2(googleSheetList);
        return results;
    }
    catch (err) {
        throw err;
    }
}