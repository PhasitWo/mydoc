const { contextBridge } = require('electron')
var fs = require('fs')
var excel = require('exceljs')

// global var
contextBridge.exposeInMainWorld('api', {
  loadDB: loadDB,
  getEssentialPath: getEssentialPath,
  saveEssentialPath: saveEssentialPath
})

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
    let obj = {
      school: null,
      form1: null,
      form2: null,
      form3: null,
      form4: null,
      form5: null,
      form6: null
    }
    let json = JSON.stringify(obj)
    fs.writeFile(filename, json, (err) => console.log("error: " + err))
    return obj
  }
}

function saveEssentialPath(obj) {
  // Create file
  const filename = "settings.json"
  let json = JSON.stringify(obj)
  fs.writeFile(filename, json, (err) => console.log("error: " + err))
}

async function loadDB() {
  let paths = getEssentialPath()
  if (paths.school == null)
    return null
  else if (paths == -1)
    return -1
  console.log("pass")
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

