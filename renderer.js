// window.onload = () => {
//     api.loadDB()
//         .then(result => document.getElementById("school").innerHTML = result)
// }

$("#link1").click(function () {
    $("#content").load("setting.html");
});

$("#link2").click(function () {
    $("#content").load("procurement.html");
});

$("#link3").click(function () {
    $("#content").load("invoice.html");
});
