const { contextBridge } = require('electron')
var fs = require('fs')
var excel = require('exceljs')

// global var
contextBridge.exposeInMainWorld('api', {
  loadDB: loadDB,
  getEssentialPath: getEssentialPath,
  saveEssentialPath: saveEssentialPath,
  getControlNumber: getControlNumber
})

function getEssentialPath() {
  const filename = "setting.json"
  if (fs.existsSync(filename)) {
    try {
      let val = JSON.parse(fs.readFileSync(filename))
      return val
    } catch (err) {
      return -1
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
      recForm2b: null
    }
    let json = JSON.stringify(obj)
    fs.writeFile(filename, json, (err) => console.log("error: " + err))
    return obj
  }
}

function saveEssentialPath(obj) {
  // Create file
  const filename = "setting.json"
  let json = JSON.stringify(obj)
  fs.writeFile(filename, json, (err) => console.log("error: " + err))
}

async function loadDB() {
  let paths = getEssentialPath()
  if (paths.database == null)
    return null
  else if (paths == -1)
    return -1
  console.log("loading database file...")
  var workbook = new excel.Workbook()
  workbook = await workbook.xlsx.readFile(paths.database)
  var ws = workbook.worksheets[0]
  // first row = row 3
  arr = []
  for (var i = 3; i <= ws.rowCount; i++) {
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

async function getControlNumber(filePath) {
  try {
    var workbook = new excel.Workbook()
    workbook = await workbook.xlsx.readFile(filePath)
    var ws = workbook.worksheets[0]
    // first row = row 3
    arr = []
    let x = ws.rowCount + 1
    let emptyRow;
    for (var i = 3; i <= x; i++) {
      let row = ws.getRow(i)
      let val = row.getCell(1).value
      if (val != null && !isNaN(val))
        arr.push(parseInt(val))
      if (val == null && emptyRow == null)
        emptyRow = i
    }
    // find next number
    let next
    arr = arr.sort((a, b) => a - b)
    for (let i = 0; i < 9999; i++) {
      if (arr[i] != i + 1) {
        next = i + 1
        break
      }
    }
    return { next: next, emptyRow: emptyRow }
  } catch (err) {
    console.log(err)
    return null
  }
}

