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
    try {
        var result = await api.getControlNumber(filePath);
    } catch (err) {
        console.log(err);
        api.openErrorBox(
            "Receipt: " + loadControlNumber.name,
            "error loading control number, please contact developer"
        );
        $("#link3").click();
    }
    document.getElementById("receipt-number").value = result.next;
    document.getElementById("receipt-number").dataset.emptyRow = result.emptyRow;
}

async function createClicked(event) {
    // event.preventDefault(); // prevent reloading after submit
    // if (!validateForm()) {
    //     api.openErrorBox("Receipt: " + createClicked.name, "please fill in all essential fields");
    //     return;
    // }
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

    let mockup = {
        fileName: "test_from_mockup3",
        saveAt: "./",
        receiptNumber: 324,
        receiptEmptyRow: 4,
        receiptDate: "2023-12-28",
        receiptForm: "sample.xlsx",
        receiptControl: "control.xlsx",
        govName: "bindai school",
        address: "",
        detail: "this is the detail",
        deliveryNumber: "123",
        deliveryDate: "",
        money: 155,
    };

    console.log(out);
    loadingStart("Creating Receipt!");
    try {
        await api.createReceipt(mockup);
    } catch (err) {
        console.log(err.cause);
        if (err.cause == "control file is currently opened") {
            api.openErrorBox("Receipt: " + createClicked.name, err.cause + ",\nplease close control file");
            return;
        }
        if (err.cause == "That file already exists") {
            api.openErrorBox("Receipt: " + createClicked.name, err.cause + ",\nplease change file name");
            return;
        }

        if (err.cause == "error reading receipt-keyword.json") {
            api.openErrorBox(
                "Receipt: " + createClicked.name,
                err.cause + ",\nplease make sure 'receipt-keyword.json' is not currently opened"
            );
            return;
        }
        if (
            err.cause == "The row is not empty" ||
            err.cause == "error reading control file" ||
            err.cause == "error reading form file" ||
            err.cause == "error writing form file"
        ) {
            api.openErrorBox("Receipt: " + createClicked.name, err.cause + ",\nplease contact developer");
            return;
        }
    } finally {
        loadingEnd();
    }

    // $("#link3").click();
}
