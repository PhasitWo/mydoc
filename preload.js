const { contextBridge, ipcRenderer, shell } = require("electron");
var fs = require("fs");
var excel = require("exceljs");

// global var
contextBridge.exposeInMainWorld("api", {
    loadDB: loadDB,
    getEssentialPath: getEssentialPath,
    saveEssentialPath: saveEssentialPath,
    getControlNumber: getControlNumber,
    createReceipt: createReceipt,
    openDialog: () => ipcRenderer.invoke("openDialog"),
    openErrorBox: (title, content) => ipcRenderer.invoke("openErrorBox", title, content),
    openPath: (filePath) => shell.openPath(filePath),
});

function getEssentialPath() {
    const filename = "setting.json";
    if (fs.existsSync(filename)) {
        try {
            let val = JSON.parse(fs.readFileSync(filename));
            return val;
        } catch (err) {
            throw Error("api.getEssentialPath failed", { cause: "cannot read setting.json" });
        }
    } else {
        // Create file
        let obj = {
            database: null,
            proControl1: null,
            proControl2: null,
            proForm1: null,
            proForm2: null,
            recControl1a: null,
            recControl1b: null,
            recControl2a: null,
            recControl2b: null,
            recForm1a: null,
            recForm1b: null,
            recForm2a: null,
            recForm2b: null,
        };
        let json = JSON.stringify(obj);
        fs.writeFile(filename, json, (err) => console.log("write file error: " + err));
        return obj;
    }
}

function saveEssentialPath(obj) {
    // Create file
    const filename = "setting.json";
    let json = JSON.stringify(obj);
    fs.writeFile(filename, json, (err) => console.log("write file error: " + err));
}

async function loadDB() {
    try {
        var paths = getEssentialPath();
    } catch (err) {
        throw Error("api.loadDB failed" + " <= " + err.message, { cause: err.cause });
    }
    if (paths.database == null) return null;
    console.log("loading database file...");
    try {
        var workbook = new excel.Workbook();
        workbook = await workbook.xlsx.readFile(paths.database);
        var ws = workbook.worksheets[0];
        // first row = row 3
        arr = [];
        for (var i = 3; i <= ws.rowCount; i++) {
            let row = ws.getRow(i);
            if (row.getCell(2).value == null) break;
            arr.push({
                name: row.getCell(2).value,
                address: row.getCell(3).value,
                person1: row.getCell(4).value,
                person2: row.getCell(5).value,
                person3: row.getCell(6).value,
                person4: row.getCell(7).value,
                person5: row.getCell(8).value,
                head: row.getCell(9).value,
            });
        }
        return arr;
    } catch (err) {
        throw Error("api.loadDB failed", { cause: "error loading database file" });
    }
}

async function getControlNumber(filePath) {
    try {
        var workbook = new excel.Workbook();
        workbook = await workbook.xlsx.readFile(filePath);
        var ws = workbook.worksheets[0];
        // first row = row 3
        arr = [];
        let x = ws.rowCount + 1;
        let emptyRow;
        for (var i = 3; i <= x; i++) {
            let row = ws.getRow(i);
            let val = row.getCell(1).value;
            if (val != null && !isNaN(val)) arr.push(parseInt(val));
            if (val == null && emptyRow == null) emptyRow = i;
        }
        // find next number
        let next;
        arr = arr.sort((a, b) => a - b);
        for (let i = 0; i < 9999; i++) {
            if (arr[i] != i + 1) {
                next = i + 1;
                break;
            }
        }
        return { next: next, emptyRow: emptyRow };
    } catch (err) {
        throw Error("api.getControlNumber failed", { cause: "error reading control file" });
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false;
    return !isNaN(str) && !isNaN(parseFloat(str));
}

async function writeControl(filePath, emptyRow, number, goveName, detail, money, date) {
    try {
        var workbook = new excel.Workbook();
        workbook = await workbook.xlsx.readFile(filePath);
        var ws = workbook.worksheets[0];
    } catch (err) {
        throw Error("api.writeControl failed", { cause: "error reading control file" });
    }
    let row = ws.getRow(emptyRow);
    // check if that row is empty
    for (let i = 1; i <= 4; i++) {
        if (row.getCell(i).value != null) throw Error("api.writeControl failed", { cause: "The row is not empty" });
    }
    row.getCell(1).value = parseInt(number);
    row.getCell(2).value = goveName;
    row.getCell(3).value = detail;
    row.getCell(4).value = parseFloat(money);
    if (date == "") {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = today.getFullYear();
        date = "Created on " + dd + "-" + mm + "-" + yyyy;
    }
    row.getCell(5).value = date;
    return workbook; // not save yet
}

async function writeForm(formPath, input, keyword) {
    try {
        var workbook = new excel.Workbook();
        workbook = await workbook.xlsx.readFile(formPath);
        var ws = workbook.worksheets[0];
    } catch (err) {
        throw Error("api.writeForm failed", { cause: "error reading form file" });
    }
    try {
        for (let i = 1; i <= ws.rowCount; i++) {
            for (let j = 1; j <= ws.columnCount; j++) {
                let cell = ws.getCell(i, j);
                let value = cell.value;
                if (typeof value != "string") continue;
                for (let prop in keyword) {
                    let replacement = input[prop];
                    if (replacement == "") replacement = keyword[prop].default;
                    if (value.includes(keyword[prop].key)) value = value.replaceAll(keyword[prop].key, replacement);
                }
                if (isNumeric(value)) value = Number(value); // convert to type number if that cell is a number
                cell.value = value;
            }
        }
    } catch (err) {
        console.log(err);
        throw Error("api.writeForm failed", { cause: "error writing form file" });
    }
    return workbook;
}

async function createReceipt({
    fileName,
    saveAt,
    receiptNumber,
    receiptEmptyRow,
    receiptDate,
    receiptForm,
    receiptControl,
    govName,
    address,
    detail,
    deliveryNumber,
    deliveryDate,
    money,
}) {
    // check both file
    fs.open("control.xlsx", "r+", (err, data) => {
        if (err != null && err.code == "EBUSY")
            throw Error("api.createReceipt failed || control file is currently opened");
    });
    if (fs.existsSync(saveAt + "\\" + fileName + ".xlsx"))
        throw Error("api.createReceipt failed || That file already exists");
    // save control
    try {
        var controlWorkbook = await writeControl(
            receiptControl,
            receiptEmptyRow,
            receiptNumber,
            govName,
            detail,
            money,
            receiptDate
        );
    } catch (err) {
        console.log(err);
        if (err.cause == "error reading control file" || err.cause == "The row is not empty")
            throw Error("api.createReceipt failed" + " <= " + err.message + " || " + err.cause);
    }
    // load keyword
    var keyword;
    const filename = "receipt-keyword.json";
    if (fs.existsSync(filename)) {
        try {
            let obj = JSON.parse(fs.readFileSync(filename));
            keyword = obj;
        } catch (err) {
            console.log(err);
            throw Error("api.createReceipt failed || error reading receipt-keyword.json");
        }
    } else {
        // Create file
        let obj = {
            receiptNumber: { key: "BILLNUMBER", default: "" },
            receiptDate: { key: "BILLDATE", default: ".".repeat(35) },
            govName: { key: "NAME", default: "" },
            address: { key: "ADDRESS2", default: ".".repeat(150) },
            detail: { key: "DETAIL", default: "" },
            deliveryNumber: { key: "DELIVERYNUMBER", default: "" },
            deliveryDate: { key: "DELIVERYDATE", default: "" },
            money: { key: "MONEY", default: "" },
        };
        let json = JSON.stringify(obj);
        fs.writeFile(filename, json, (err) => console.log("write file error: " + err));
        keyword = obj;
    }
    // write form
    // convert to Thai date
    if (receiptDate != "") {
        let date = new Date(receiptDate);
        receiptDate = date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
    if (deliveryDate != "") {
        date = new Date(deliveryDate);
        deliveryDate = date.toLocaleDateString("th-TH", {
            year: "2-digit",
            month: "short",
            day: "numeric",
        });
    }
    let input = {
        receiptNumber: receiptNumber,
        receiptDate: receiptDate,
        govName: govName,
        address: address,
        detail: detail,
        deliveryNumber: deliveryNumber,
        deliveryDate: deliveryDate,
        money: money,
    };
    try {
        var formWorkbook = await writeForm(receiptForm, input, keyword);
    } catch (err) {
        console.log(err);
        if (err.cause == "error reading form file" || err.cause == "error writing form file")
            throw Error("api.createReceipt failed" + " <= " + err.message + " || " + err.cause);
    }
    // both writeControl and writeForm complete
    controlWorkbook.xlsx.writeFile(receiptControl);
    formWorkbook.xlsx.writeFile(saveAt + "/" + fileName + ".xlsx");
}
