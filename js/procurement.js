// setup autocomplete
setupAutocomplete();
// essential paths
try {
    var essentialPaths = api.getEssentialPath();
    console.log("essential paths loaded");
} catch (err) {
    console.log(err);
    api.openErrorBox("Procurement: " + "main", "error reading setting file, please contact developer");
    $("#content").load("welcome.html");
}

async function setupAutocomplete() {
    if (database == null) database = await loadDB(); // loadDB after user set path to DB
    if (database != null) {
        database.forEach((school) => {
            datalist = document.getElementById("gov-list");
            option = document.createElement("option");
            option.innerHTML = school.name;
            datalist.appendChild(option);
        });
    }
}

async function getDir() {
    let result = await api.openDialog();
    document.getElementById("save-at-path").textContent = result;
}

function loadInfo() {
    let val = document.getElementById("gov-name").value;
    let info = ["address", "person1", "person2", "person3", "person4", "person5", "head"];
    for (var school of database) {
        if (val == school.name) {
            // set info
            for (let inf of info) {
                document.getElementById(inf).value = school[inf]
            }
            document.getElementById("address").readOnly = true
            // set status
            document.getElementById("gov-name-status").textContent = "✓ found in database";
            document.getElementById("gov-name-status").style.color = "green";
            return;
        }
    }
    for (let inf of info) {
        document.getElementById(inf).value = "";
    }
    document.getElementById("address").readOnly = false
    document.getElementById("gov-name-status").textContent = "not found";
    document.getElementById("gov-name-status").style.color = "red";
}

function validateForm() {
    for (var id of ["file-name", "shop", "receipt-number", "gov-name", "buy", "money"]) {
        if (document.getElementById(id).value == "") {
            console.log(`missing ${id}`);
            return false;
        }
    }
    if (document.getElementById("save-at-path").textContent == "") {
        console.log("missing folder");
        return false;
    }
    if (document.getElementById("receipt-number").dataset.emptyRow == "") {
        console.log("emptyRow is empty");
        return false;
    }
    return true;
}

async function loadControlNumber() {
    let shop = document.getElementById("shop").value;
    let flag = true;
    let formPath = essentialPaths["proForm" + shop];
    if (formPath == null) {
        api.openErrorBox("Procurement: " + loadControlNumber.name, "please import form for that particular shop");
        flag = false;
    }
    let filePath = essentialPaths["proControl" + shop];
    if (filePath == null) {
        api.openErrorBox("Procurement: " + loadControlNumber.name, "please import control excel file for that shop");
        flag = false;
    }
    if (!flag) {
        document.getElementById("shop").value = "";
        document.getElementById("delivery-number").value = "";
        document.getElementById("delivery-number").dataset.emptyRow = "";
        return;
    }
    try {
        var result = await api.getControlNumber(filePath);
    } catch (err) {
        console.log(err);
        api.openErrorBox(
            "Procurement: " + loadControlNumber.name,
            "error loading control number, please contact developer"
        );
        $("#link3").click();
    }
    document.getElementById("delivery-number").value = result.next;
    document.getElementById("delivery-number").dataset.emptyRow = result.emptyRow;
}