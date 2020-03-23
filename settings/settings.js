const { remote } = require("electron");
const Store = require("electron-store");
const settingsStore = new Store({ name: "Settings" });

const $ = id => {
  return document.getElementById(id);
};

document.addEventListener("DOMContentLoaded", () => {
  let savedLocation = settingsStore.get('savedFileLocation');
  console.log(savedLocation);
  if(savedLocation) {
    $("savedFileLocation").value = savedLocation;
  }
  $("select-new-location").addEventListener("click", () => {
    remote.dialog
      .showOpenDialog({
        properties: ["openDirectory"],
        message: "选择文件的存储路径"
      })
      .then(({ canceled, filePaths }) => {
        if (!canceled) {
          $("savedFileLocation").value = filePaths[0];
          savedLocation = filePaths[0];
        }
      });
  });
  $("settings-form").addEventListener("submit", () => {
    console.log('submit', savedLocation);
    settingsStore.set("savedFileLocation", savedLocation);
    remote.getCurrentWindow().close();
  });
});
