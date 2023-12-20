// window.onload = () => {
//     api.loadDB()
//         .then(result => document.getElementById("school").innerHTML = result)
// }

$("#button1").click(function () {
    $("#content").load("setting.html");
});

$("#button2").click(function () {
    $("#content").load("procurement.html");
});

$("#button3").click(function () {
    $("#content").load("invoice.html");
});
