const excel = require("exceljs");

async function saveControl(filePath, emptyRow, number, detail, money, date) {
    try {
        var workbook = new excel.Workbook();
        workbook = await workbook.xlsx.readFile(filePath);
        var ws = workbook.worksheets[0];
    } catch (err) {
        throw Error("api.saveControl failed", { cause: "error reading control file" });
    }
    let row = ws.getRow(emptyRow);
    // check if that row is empty
    for (let i = 1; i <= 4; i++) {
        if (row.getCell(i).value != null) throw Error("api.saveControl failed", { cause: "The row is not empty" });
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
        var controlWorkbook = await saveControl(
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
    controlWorkbook.xlsx.writeFile(receiptControl); // save when other operation also complete
    // write form
    // TODO....

    // 2. write form code
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
createReceipt(mockup);

function test_err({a, b, c}) {
    console.log(a)
}

