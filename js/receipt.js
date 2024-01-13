// setup autocomplete
setupAutocomplete();
// essential paths
try {
    var essentialPaths = api.getEssentialPath();
    console.log("essential paths loaded");
} catch (err) {
    console.log(err);
    api.openErrorBox("Receipt: " + "main", "error reading setting file, please contact developer");
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

function validateForm() {
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
    try {
        var result = await api.getControlNumber(filePath);
    } catch (err) {
        console.log(err);
        api.openErrorBox(
            "Receipt: " + loadControlNumber.name,
            "error loading control number, please contact developer"
        );
        $("#receipt").click();
    }
    document.getElementById("receipt-number").value = result.next;
    document.getElementById("receipt-number").dataset.emptyRow = result.emptyRow;
}

function clearForm() {
    document.getElementById("save-at-path").textContent = "";
    document.getElementById("gov-name-status").textContent = "";
    document.getElementById("receipt-form").reset();
}

async function createClicked(event) {
    event.preventDefault(); // prevent reloading after submit
    if (!validateForm()) {
        api.openErrorBox("Receipt: " + createClicked.name, "please fill in all essential fields");
        return;
    }
    let userInput = {
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
    console.log(userInput);
    loadingStart("Creating Receipt!");
    try {
        await api.createReceipt(userInput);
    } catch (err) {
        loadingEnd();
        console.log(err);
        let cause = err.message.split(" || ")[1];
        if (cause == "control file is currently opened") {
            api.openErrorBox("Receipt: " + createClicked.name, cause + ",\nplease close control file");
            return;
        }
        if (cause == "That file already exists") {
            api.openErrorBox("Receipt: " + createClicked.name, cause + ",\nplease change file name");
            return;
        }

        if (cause == "error reading receipt-keyword.json") {
            api.openErrorBox(
                "Receipt: " + createClicked.name,
                cause + ",\nplease make sure 'receipt-keyword.json' is not currently opened"
            );
            return;
        }
        if (
            cause == "The row is not empty" ||
            cause == "error reading control file" ||
            cause == "error reading form file" ||
            cause == "error writing form file"
        ) {
            api.openErrorBox("Receipt: " + createClicked.name, cause + ",\nplease contact developer");
            return;
        }
    }
    setTimeout(() => {
        loadingEnd();
        clearForm();
        api.openPath(userInput.saveAt + "/" + userInput.fileName + ".xlsx");
    }, 1500);
}

function checkInvalidChar() {
    for (let char of ["\\", "/", ":", "*", "?", "|", "<", ">", '"']) {
        let val = document.getElementById("file-name").value;
        if (val.includes(char)) {
            document.getElementById("file-name").value = val.replace(char, "");
            api.openErrorBox(
                "Receipt: " + checkInvalidChar.name,
                'File Name cannot contains these characters\n\\  /  :  *  ?  |  <  >  "'
            );
        }
    }
}
