const excel = require("exceljs");
const fs  = require("fs");

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
                if (typeof value != 'string') continue;
                for (let prop in keyword) {
                    let replacement = input[prop];
                    if (replacement == "") replacement = keyword[prop].default;
                    if (value.includes(keyword[prop].key)) value = value.replaceAll(keyword[prop].key, replacement);
                }
                cell.value = value;
            }
        }
    } catch (err) {
        console.log(err)
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
    // load keyword
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
    // write form
    try {
        var formWorkbook = await writeForm(receiptForm, input, keyword);
    } catch (err) {
        if (err.cause == "error reading form file")
            throw Error("createReceipt failed" + " <= " + err.message, { cause: err.cause });
        if (err.cause == "error writing form file")
            throw Error("createReceipt failed" + " <= " + err.message, { cause: err.cause });
    }
    // both writeControl and writeForm complete
    controlWorkbook.xlsx.writeFile(receiptControl)
    formWorkbook.xlsx.writeFile(saveAt+"/"+fileName+".xlsx")
}

// main

let mockup = {
    fileName: "test_from_mockup",
    saveAt: "/Users/phasit/Desktop/ElectronProject/mydoc",
    receiptNumber: 888,
    receiptEmptyRow: 17,
    receiptDate: "",
    receiptForm: "sample.xlsx",
    receiptControl: "control.xlsx",
    govName: "bindai school",
    address: "",
    detail: "this is the detail",
    deliveryNumber: "888",
    deliveryDate: "",
    money: "1234",
};
createReceipt(mockup);
