const { contextBridge, ipcRenderer } = require('electron')
var fs = require('fs')

// check cache data
var essentialPath
const filename = "settings.json"
fs.exists(filename, (exists) => {
  if (!exists) {
    // Create file
    let obj = { school: null, invoiceForm1: null, invoiceForm2: null, invoiceForm3: null, invoiceForm4: null }
    let json = JSON.stringify(obj)
    fs.writeFile(filename, json, (err) => console.log(err))
  }
  else {
    console.log("settings.json exists");
    fs.readFile(filename, (err, data) => {
      if (err)
        console.log(err)
      else {
        essentialPath = data
        console.log(data)
      }
    })
  }
});

function loadDB() {

}

// global var
contextBridge.exposeInMainWorld('preload', {
  schoolData: loadDB()
})