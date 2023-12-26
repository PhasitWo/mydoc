// load paths
try {
    var paths = api.getEssentialPath();
} catch (err) {
    console.log(err);
    api.openErrorBox("Setting: " + "main", "error reading setting file, please contact developer");
}
if (paths != null) {
    for (var prop in paths) {
        let val = paths[prop];
        document.getElementById(prop + "-path").innerHTML = val == null ? "----None----" : val;
    }
}
// save
document.getElementById("save-button").onclick = () => {
    var paths = Object();
    [
        "database",
        "proControl1",
        "proControl2",
        "proForm1",
        "proForm2",
        "recControl1a",
        "recControl1b",
        "recControl2a",
        "recControl2b",
        "recForm1a",
        "recForm1b",
        "recForm2a",
        "recForm2b",
    ].forEach((prop) => {
        try {
            let val = document.getElementById(prop + "-browse").files[0].path;
            paths[prop] = val;
        } catch {
            let val = document.getElementById(prop + "-path").textContent;
            paths[prop] = val == "----None----" ? null : val;
        }
    });
    console.log(paths);
    api.saveEssentialPath(paths);
    // show message
    loadingStart("Settings Saved!");
    setTimeout(() => {
        loadingEnd();
        // refresh page
        $("#link1").click();
    }, 1500);
};
