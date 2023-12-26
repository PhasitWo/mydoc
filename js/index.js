// navbar
$("#link1").click(function () {
    $("#content").load("setting.html");
    document.getElementById("active").style.display = "block";
    document.getElementById("active").style.top = "0%";
    document.getElementById("link1").classList.add("black");
    document.getElementById("link2").classList.remove("black");
    document.getElementById("link3").classList.remove("black");
});
$("#link2").click(function () {
    $("#content").load("procurement.html");
    document.getElementById("active").style.display = "block";
    document.getElementById("active").style.top = "35.33%";
    document.getElementById("link1").classList.remove("black");
    document.getElementById("link2").classList.add("black");
    document.getElementById("link3").classList.remove("black");
});
$("#link3").click(function () {
    $("#content").load("receipt.html");
    document.getElementById("active").style.display = "block";
    document.getElementById("active").style.top = "68.66%";
    document.getElementById("link1").classList.remove("black");
    document.getElementById("link2").classList.remove("black");
    document.getElementById("link3").classList.add("black");
});
// load database
var database;
loadDB().then((result) => {
    database = result;
});
// load welcome page
$("#content").load("welcome.html");

async function loadDB() {
    // reuse in rec and pro script
    try {
        var result = await api.loadDB();
    } catch (err) {
        console.log(err);
        if (err.cause == "cannot read setting.json") {
            api.openErrorBox("Index: " + loadDB.name, "error reading setting file, please contact developer");
            return;
        }
        if (err.cause == "error loading database file") {
            api.openErrorBox(
                "Index: " + loadDB.name,
                "error loading database file\nmake sure you put in the right path"
            );
            $("#link1").click();
            return;
        }
    }

    if (result == null) {
        api.openErrorBox("Index: " + loadDB.name, "please set path to database in Setting");
        $("#link1").click();
        return;
    }
    console.log("database loaded");
    return result;
}

function loadingStart(message) {
    document.getElementById("loading").style.display = "block";
    document.getElementById("navbar").classList.toggle("loading");
    document.getElementById("content").classList.toggle("loading");
    document.getElementById("loading-message").innerHTML = message;
}

function loadingEnd() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("navbar").classList.toggle("loading");
    document.getElementById("content").classList.toggle("loading");
    document.getElementById("loading-message").innerHTML = "";
}
