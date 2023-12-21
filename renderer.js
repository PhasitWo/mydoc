// navbar
$("#link1").click(function () {
    $("#content").load("setting.html");
    document.getElementById("active").style.display = "block"
    document.getElementById("active").style.top = "0%"
    document.getElementById("link1").classList.add("black")
    document.getElementById("link2").classList.remove("black")
    document.getElementById("link3").classList.remove("black")
});

$("#link2").click(function () {
    $("#content").load("procurement.html");
    document.getElementById("active").style.display = "block"
    document.getElementById("active").style.top = "35.33%"
    document.getElementById("link1").classList.remove("black")
    document.getElementById("link2").classList.add("black")
    document.getElementById("link3").classList.remove("black")
});
$("#link3").click(function () {
    $("#content").load("receipt.html");
    document.getElementById("active").style.display = "block"
    document.getElementById("active").style.top = "68.66%"
    document.getElementById("link1").classList.remove("black")
    document.getElementById("link2").classList.remove("black")
    document.getElementById("link3").classList.add("black")
});
// load database
var database
loadDB().then(result => {
    database = result
})
// load welcome page
$("#content").load("welcome.html")

async function loadDB() { // reuse in rec and pro script
    let result = await api.loadDB()
    if (result == -1)
        alert("loading Database\nerror reading setting file, \nplease contact developer")
    else if (result == null) {
        alert("please set path to database in Setting")
        $("#link1").click()
    }
    return result
}