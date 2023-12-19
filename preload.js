const { contextBridge, ipcRenderer } = require('electron')
var fs = require('fs')
var excel = require('exceljs')

function getEssentialPath() {
  const filename = "settings.json"
  if (fs.existsSync(filename)) {
    console.log("settings.json exists");
    try {
      let val = JSON.parse(fs.readFileSync(filename))
      return val
    } catch (err) {
      return -1
    }
  } else {
    // Create file
    let obj = { school: null, invoiceForm1: null, invoiceForm2: null, invoiceForm3: null, invoiceForm4: null }
    let json = JSON.stringify(obj)
    fs.writeFile(filename, json, (err) => console.log("error: " + err))
    return null
  }
}

async function loadDB() {
  let paths = getEssentialPath()
  if (paths == null)
      return null
  else if (paths == -1)
      return -1
  var workbook = new excel.Workbook()
  workbook = await workbook.xlsx.readFile(paths.school)
  var ws = workbook.worksheets[0]
  // first row = row 3
  arr = []
  for (var i = 3; i < ws.rowCount; i++) {
      let row = ws.getRow(i)
      if (row.getCell(2).value == null)
          break
      arr.push({
          name: row.getCell(2).value,
          address: row.getCell(3).value,
          person1: row.getCell(4).value,
          person2: row.getCell(5).value,
          person3: row.getCell(6).value,
          person4: row.getCell(7).value,
          person5: row.getCell(8).value,
          head: row.getCell(9).value
      })
  }
  return arr
}

// global var
contextBridge.exposeInMainWorld('api', {
  loadDB: loadDB,
  getEssentialPath: getEssentialPath
})
