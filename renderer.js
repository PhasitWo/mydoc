// navbar
$("#link1").click(function () {
    $("#content").load("setting.html");
});

$("#link2").click(function () {
    $("#content").load("procurement.html");
});

$("#link3").click(function () {
    $("#content").load("receipt.html");
});
// load database
var database
api.loadDB().then((result) => {
    if (result == -1)
        alert("loading Database\nerror reading setting file, \nplease contact developer")
    else if (result == null) {
        alert("please set path to database in Setting")
        $("#link1").click()
    }   
    database = result
})

