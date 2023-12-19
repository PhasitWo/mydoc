window.onload = () => {
    api.loadDB()
        .then(result => document.getElementById("school").innerHTML = result)
}



