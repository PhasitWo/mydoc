// setup autocomplete
setupAutocomplete();
// essential paths
var essentialPaths = api.getEssentialPath();
console.log("loading essential paths...");
if (essentialPaths == -1) {
    api.openErrorBox("Receipt: " + "main", "error reading setting file, please contact developer");
    $("#content").load("welcome.html");
}
async function setupAutocomplete() {
    if (database == null) database = await loadDB(); // loadDB after user set path to DB
    database.forEach((school) => {
        datalist = document.getElementById("gov-list");
        option = document.createElement("option");
        option.innerHTML = school.name;
        datalist.appendChild(option);
    });
}

async function getDir() {
    let result = await api.openDialog();
    document.getElementById("save-at-path").textContent = result;
}

function loadAddress() {
    let val = document.getElementById("gov-name").value;
    for (var school of database) {
        if (val == school.name) {
            document.getElementById("address").value = school.address;
            document.getElementById("address").readOnly = true;
            document.getElementById("gov-name-status").textContent = "✓ found in database";
            document.getElementById("gov-name-status").style.color = "green";
            return;
        }
    }
    document.getElementById("address").value = "";
    document.getElementById("address").readOnly = false;
    document.getElementById("gov-name-status").textContent = "not found";
    document.getElementById("gov-name-status").style.color = "red";
}

function createClicked() {
    if (!validateForm()) {
        api.openErrorBox("Receipt: " + createClicked.name, "please fill in all essential fields");
        return;
    }
    let out = {
        fileName: document.getElementById("file-name").value,
        saveAt: document.getElementById("save-at-path").textContent,
        receiptNumber: document.getElementById("receipt-number").value,
        receiptEmptyRow: document.getElementById("receipt-number").dataset.emptyRow,
        receiptDate: document.getElementById("receipt-date").value,
        receiptForm: essentialPaths[`recForm${document.getElementById("shop").value}`],
        receiptControl: essentialPaths[`recControl${document.getElementById("shop").value}`],
        govName: document.getElementById("gov-name").value,
        address: document.getElementById("address").value,
        detail: document.getElementById("detail").value,
        deliveryNumber: document.getElementById("delivery-number").value,
        deliveryDate: document.getElementById("delivery-date").value,
        money: document.getElementById("money").value,
    };
    api.createReceipt(out);
    console.log(out);
    $("#link3").click();
}

function validateForm() {
    for (var id of ["file-name", "shop", "receipt-number", "gov-name", "detail", "money"]) {
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
    let formPath = essentialPaths["recForm" + shop];
    if (formPath == null) {
        api.openErrorBox("Receipt: " + loadControlNumber.name, "please import form for that particular shop");
        flag = false;
    }
    let filePath = essentialPaths["recControl" + shop];
    if (filePath == null) {
        api.openErrorBox("Receipt: " + loadControlNumber.name, "please import control excel file for that shop");
        flag = false;
    }
    if (!flag) {
        document.getElementById("shop").value = "";
        document.getElementById("receipt-number").value = "";
        document.getElementById("receipt-number").dataset.emptyRow = "";
        return;
    }
    let result = await api.getControlNumber(filePath);
    if (result == null) {
        api.openErrorBox(
            "Receipt: " + loadControlNumber.name,
            "error loading control number, please contact developer"
        );
        $("#link3").click();
    }
    document.getElementById("receipt-number").value = result.next;
    document.getElementById("receipt-number").dataset.emptyRow = result.emptyRow;
}

function test() {
    loadingStart("Create Button is clicked!!!");
    setTimeout(loadingEnd, 1500);
}
