// const excel = require("exceljs");

// let mockup = {
//     fileName: "test_from_mockup",
//     saveAt: "/Users/phasit/Desktop/ElectronProject/mydoc",
//     receiptNumber: 12,
//     receiptEmptyRow: 14,
//     receiptDate: "",
//     receiptForm: "sample.xlsx",
//     receiptControl: "/Users/phasit/Desktop/ElectronProject/mydoc/control.xlsx",
//     govName: "bindai school",
//     address: "Mars, Solar System",
//     detail: "this is the detail",
//     deliveryNumber: "888",
//     deliveryDate: "",
//     money: "1234",
// };

// async function createReceipt({
//     fileName,
//     saveAt,
//     receiptNumber,
//     receiptEmptyRow,
//     receiptDate,
//     receiptForm,
//     receiptControl,
//     govName,
//     address,
//     detail,
//     deliveryNumber,
//     deliveryDate,
//     money,
// }) {
//     // save control
//     let controlWorkbook = await saveControl(receiptControl, receiptEmptyRow, receiptNumber, detail, money, receiptDate);
//     if (controlWorkbook == -1) {
//         api.openErrorBox("preload: " + createReceipt.name, "error loading control file");
//         return;
//     } else if (controlWorkbook == -2) {
//         api.openErrorBox("preload: " + createReceipt.name, "The row is not empty");
//         return;
//     }
//     controlWorkbook.xlsx.writeFile(receiptControl);
//     // write form

// }

// async function saveControl(filePath, emptyRow, number, detail, money, date) {
//     try {
//         var workbook = new excel.Workbook();
//         workbook = await workbook.xlsx.readFile(filePath);
//         var ws = workbook.worksheets[0];
//     } catch (err) {
//         console.log(err);
//         return -1;
//     }
//     let row = ws.getRow(emptyRow);
//     // check if that row is empty
//     for (let i = 1; i <= 4; i++) {
//         if (row.getCell(i).value != null) return -2;
//     }
//     row.getCell(1).value = parseInt(number);
//     row.getCell(2).value = detail;
//     row.getCell(3).value = parseFloat(money);
//     if (date == "") {
//         var today = new Date();
//         var dd = String(today.getDate()).padStart(2, "0");
//         var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
//         var yyyy = today.getFullYear();
//         date = "Created on" + dd + "-" + mm + "-" + yyyy;
//     }
//     row.getCell(4).value = date;
//     return workbook; // not save yet
// }
// // main
// createReceipt(mockup);

function test_err() {
    let x
    if (x == null) {
        throw Error("Errorasdasdsadsad")
    }
}
test_err()