const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 820,
        height: 750,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
        },
    });
    ipcMain.handle("openDialog", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });
        if (canceled) return;
        else return filePaths[0];
    });
    ipcMain.handle("openErrorBox", (event, title, content) => {
        dialog.showErrorBox(title, content);
        return;
    });
    // win.removeMenu();
    win.loadFile("./templates/index.html");
};

app.whenReady().then(() => {
    createWindow();
});
app.on("window-all-closed", () => {
    app.quit();
});
