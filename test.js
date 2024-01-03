const excel = require("exceljs");

async function test() {
    var workbook = new excel.Workbook();
    workbook = await workbook.xlsx.readFile("หจก New Procurement Form.xlsx");
    workbook.xlsx.writeFile("dup.xlsx")
    
}

test()