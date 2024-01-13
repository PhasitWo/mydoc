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
    let info = ["address", "headchecker", "checker1", "checker2", "object", "headobject", "boss"];
    for (var school of database) {
        if (val == school.name) {
            // set info
            for (let inf of info) {
                document.getElementById(inf).value = school[inf];
            }
            document.getElementById("address").readOnly = true;
            // set status
            document.getElementById("gov-name-status").textContent = "✓ found in database";
            document.getElementById("gov-name-status").style.color = "green";
            return;
        }
    }
    for (let inf of info) {
        document.getElementById(inf).value = "";
    }
    document.getElementById("address").readOnly = false;
    document.getElementById("gov-name-status").textContent = "not found";
    document.getElementById("gov-name-status").style.color = "red";
}

function validateForm() {
    if (document.getElementById("save-at-path").textContent == "") {
        console.log("missing folder");
        return false;
    }
    if (document.getElementById("delivery-number").dataset.emptyRow == "") {
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
        $("#procurement").click();
    }
    document.getElementById("delivery-number").value = result.next;
    document.getElementById("delivery-number").dataset.emptyRow = result.emptyRow;
}

function clearForm() {
    document.getElementById("save-at-path").textContent = "";
    document.getElementById("gov-name-status").textContent = "";
    document.getElementById("procurement-form").reset();
}

async function createClicked(event) {
    event.preventDefault(); // prevent reloading after submit
    if (!validateForm()) {
        api.openErrorBox("Procurement: " + createClicked.name, "please fill in all essential fields");
        return;
    }
    let userInput = {
        fileName: document.getElementById("file-name").value,
        saveAt: document.getElementById("save-at-path").textContent,
        deliveryNumber: document.getElementById("delivery-number").value,
        deliveryDate: document.getElementById("delivery-date").value,
        deliveryEmptyRow: document.getElementById("delivery-number").dataset.emptyRow,
        procurementForm: essentialPaths[`proForm${document.getElementById("shop").value}`],
        procurementControl: essentialPaths[`proControl${document.getElementById("shop").value}`],
        buy: document.getElementById("buy").value,
        project: document.getElementById("project").value,
        money: document.getElementById("money").value,
        govName: document.getElementById("gov-name").value,
        address: document.getElementById("address").value,
        headchecker: document.getElementById("headchecker").value,
        checker1: document.getElementById("checker1").value,
        checker2: document.getElementById("checker2").value,
        object: document.getElementById("object").value,
        headobject: document.getElementById("headobject").value,
        boss: document.getElementById("boss").value,
    };
    console.log(userInput);
    loadingStart("Creating Procurement!");
    try {
        await api.createProcurement(userInput);
    } catch (err) {
        loadingEnd();
        console.log(err);
        let cause = err.message.split(" || ")[1];
        if (cause == "control file is currently opened") {
            api.openErrorBox("Procurement: " + createClicked.name, cause + ",\nplease close control file");
            return;
        }
        if (cause == "That file already exists") {
            api.openErrorBox("Procurement: " + createClicked.name, cause + ",\nplease change file name");
            return;
        }

        if (cause == "error reading procurement-keyword.json") {
            api.openErrorBox(
                "Procurement: " + createClicked.name,
                cause + ",\nplease make sure 'procurement-keyword.json' is not currently opened"
            );
            return;
        }
        if (
            cause == "The row is not empty" ||
            cause == "error reading control file" ||
            cause == "error reading form file" ||
            cause == "error writing form file"
        ) {
            api.openErrorBox("Procurement: " + createClicked.name, cause + ",\nplease contact developer");
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
