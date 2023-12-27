const excel = require("exceljs");
const { write } = require("fs");

async function writeControl(filePath, emptyRow, number, detail, money, date) {
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
    row.getCell(2).value = detail;
    row.getCell(3).value = parseFloat(money);
    if (date == "") {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = today.getFullYear();
        date = "Created on " + dd + "-" + mm + "-" + yyyy;
    }
    row.getCell(4).value = date;
    return workbook; // not save yet
}

async function writeForm(args, keyword) {
    try {
        var workbook = new excel.Workbook();
        workbook = await workbook.xlsx.readFile(receiptForm);
        var ws = workbook.worksheets[0];
    } catch (err) {
        throw Error("api.createReceipt failed", { cause: "error reading form file" });
    }
    for (let i = 1; i <= ws.rowCount; i++) {
        for (let j = 1; j <= ws.columnCount; j++) {
            let cell = ws.getCell(i, j);
            let value = cell.value;
            if (value == null) continue;
            for (let key in keyword) {
                if (value.includes(keyword[key])) value = value.replaceAll(keyword[key], args[key]);
            }
            cell.value = value;
        }
    }
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
    var args = {
        fileName: fileName,
        saveAt: saveAt,
        receiptNumber: receiptNumber,
        receiptEmptyRow: receiptEmptyRow,
        receiptDate: receiptDate,
        receiptForm: receiptForm,
        receiptControl: receiptControl,
        govName: govName,
        address: address,
        detail: detail,
        deliveryNumber: deliveryNumber,
        deliveryDate: deliveryDate,
        money: money,
    };
    // save control
    try {
        var controlWorkbook = await writeControl(
            receiptControl,
            receiptEmptyRow,
            receiptNumber,
            detail,
            money,
            receiptDate
        );
    } catch (err) {
        console.log(err);
        if (err.cause == "error reading control file") {
            throw Error("createReceipt failed" + " <= " + err.message, { cause: err.cause });
        }
        if (err.cause == "The row is not empty") {
            throw Error("createReceipt failed" + " <= " + err.message, { cause: err.cause });
        }
    }
    // controlWorkbook.xlsx.writeFile(receiptControl); // save when other operation also complete
    // write form
    var keyword;
    const filename = "receipt-keyword.json";
    if (fs.existsSync(filename)) {
        try {
            let obj = JSON.parse(fs.readFileSync(filename));
            keyword = obj;
        } catch (err) {
            throw Error("api.createReceipt failed", { cause: "error reading receipt-keyword.json" });
        }
    } else {
        // Create file
        let obj = {
            receiptNumber: "BILLNUMBER",
            receiptDate: "BILLDATE",
            govName: "NAME",
            address: "ADDRESS2",
            detail: "DETAIL",
            deliveryNumber: "DELIVERYNUMBER",
            deliveryDate: "DELIVERYDATE",
            money: "MONEY",
        };
        let json = JSON.stringify(obj);
        fs.writeFile(filename, json, (err) => console.log("write file error: " + err));
        keyword = obj;
    }
    writeForm()
}

// main

let mockup = {
    fileName: "test_from_mockup",
    saveAt: "/Users/phasit/Desktop/ElectronProject/mydoc",
    receiptNumber: 888,
    receiptEmptyRow: 15,
    receiptDate: "",
    receiptForm: "sample.xlsx",
    receiptControl: "control.xlsx",
    govName: "bindai school",
    address: "Mars, Solar System",
    detail: "this is the detail",
    deliveryNumber: "888",
    deliveryDate: "",
    money: "1234",
};
// createReceipt(mockup);

let o = { a: 1, b: 2 };
for (let key in o) console.log(o[key]);
