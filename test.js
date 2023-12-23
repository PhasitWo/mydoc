var excel = require('exceljs')

async function test() {
    var workbook = new excel.Workbook()
    workbook = await workbook.xlsx.readFile(filePath)
    var ws = workbook.worksheets[0]
}