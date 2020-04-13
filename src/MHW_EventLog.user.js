// ==UserScript==
// @name        Monster Hunter World - Event Log
// @description Keep track of the Event Quest Schedule. Mark completed ones and hide them if you want.
// @author      alike03
// @version     1.2
// @namespace   MHW_EventLog
// @icon        https://raw.githubusercontent.com/alike03/Userscripts/master/assets/MHW_EventLog-Icon.png
// @supportURL  https://github.com/alike03/Userscripts/issues
// @downloadURL https://raw.githubusercontent.com/alike03/Userscripts/master/src/MHW_EventLog.user.js
// @updateURL   https://raw.githubusercontent.com/alike03/Userscripts/master/meta/MHW_EventLog.user.js
// @match       *://game.capcom.com/world/*/schedule*.html*
// ==/UserScript==

let eventList = [];
let settings = [];
let platform = (window.location.href.indexOf("steam") != -1) ? "steam_" : "console_";
let filename = platform + window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1).replace(".html", "");
let localEventList = "localEventList_" + filename;
let localSavedSettings = "savedSettings";

window.addEventListener('load', function () {
  loadSave();
  addCSS();
  addButtonLocationDiv();
  addButtons();
  addButtonClicks();
  addDoneButton();
  addExportImport();
});

function loadSave() {
  if (localStorage.getItem(localEventList) != null)
    eventList = JSON.parse(localStorage.getItem(localEventList));
}

function fileSave() {

  localStorage.setItem(localEventList, JSON.stringify(eventList));
  localStorage.setItem(localSavedSettings, JSON.stringify(settings));
}

function addCSS() {
  let style = document.createElement('style');
  style.innerHTML = `
  .buttonExIm {
    margin-bottom: 10px !important;
  }
  
  .alikeExIm {
    width: 50%;
  }

  .alikeExIm,
  .alikeStatus,
  .alikeHide,
  .alikeCurrent {
    display: inline-block;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .alikeStatus {
    border: 2px solid #756b5e;
    padding: 5px 5px 8px;
    margin-top: 15px;
    text-shadow: 2px 2px 8px black;
  }

  .alikeHide,
  .alikeCurrent {
    margin: 15px 15px 0 0;
    font-size: 1.3rem;
    color: #756b5e;
  }

  .alikeStatus.completed,
    tr.completed .alikeStatus {
    color: white;
    background: #756b5e;
  }

  #wrap table tbody tr.completed {
    opacity: 0.35;
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
    animation: animationComplete 1s;
  }

  #wrap table.hide tbody tr.completed,
  #wrap table.notToday tbody tr:not(.disp) {
    display: none !important;
    animation: myfirst 2s;
  }

  @keyframes animationComplete {
    0%   {opacity: 1;}
    100% {opacity: 0.35;}
  }
  `;
  document.head.appendChild(style);
}

function addButtonLocationDiv() {
  const buttonLocation = document.createElement("div");
  buttonLocation.classList.add('alikeButtons');

  let element = document.querySelectorAll("#schedule .tableArea .tableTitle");
  for (let i = 0; i < element.length; i++) {
    let butLocClone = buttonLocation.cloneNode(true);
    element[i].appendChild(butLocClone);
  }

  const buttonExIm = document.createElement("div");
  buttonExIm.classList.add('buttonExIm');
  buttonExIm.classList.add('terms');
  let pElement = document.querySelector("#schedule .eventCol");
  pElement.insertBefore(buttonExIm, pElement.firstChild);
}

function addButtons() {
  const buttonHide = document.createElement("div");
  buttonHide.classList.add('alikeStatus');
  buttonHide.classList.add('alikeHide');
  buttonHide.textContent = "Hide Done Events";

  const buttonCurrent = document.createElement("div");
  buttonCurrent.classList.add('alikeStatus');
  buttonCurrent.classList.add('alikeCurrent');
  buttonCurrent.textContent = "Hide not currently running Events";

  let element = document.querySelectorAll("#schedule .tableArea .alikeButtons");
  for (let i = 0; i < element.length; i++) {
    element[i].appendChild(buttonHide.cloneNode(true));
    element[i].appendChild(buttonCurrent.cloneNode(true));
  }
}

function addButtonClicks() {
  elementHide = document.querySelectorAll(".alikeHide");
  for (let i = 0; i < elementHide.length; i++) {
    elementHide[i].addEventListener('click', function (event) {
      if (this.classList.contains('completed')) {
        elementHide.forEach(element => {
          element.classList.remove('completed');
          element.parentNode.parentNode.nextElementSibling.classList.remove('hide');
        });
        for (var i = 0; i < settings.length; i++) {
          if (settings[i] === "alikeHide") {
            settings.splice(i, 1);
          }
        }
      } else {
        elementHide.forEach(element => {
          element.classList.add('completed');
          element.parentNode.parentNode.nextElementSibling.classList.add('hide');
        });
        if (!settings.includes("alikeHide"))
          settings.push("alikeHide");
      }
      fileSave();
    });
  }

  elementCurrent = document.querySelectorAll(".alikeCurrent");
  for (let i = 0; i < elementCurrent.length; i++) {
    elementCurrent[i].addEventListener('click', function (event) {
      if (this.classList.contains('completed')) {
        elementCurrent.forEach(element => {
          element.classList.remove('completed');
          element.parentNode.parentNode.nextElementSibling.classList.remove('notToday');
        });

        for (var i = 0; i < settings.length; i++) {
          if (settings[i] === "alikeCurrent") {
            settings.splice(i, 1);
          }
        }
      } else {
        elementCurrent.forEach(element => {
          element.classList.add('completed');
          element.parentNode.parentNode.nextElementSibling.classList.add('notToday');
        });
        if (!settings.includes("alikeCurrent"))
          settings.push("alikeCurrent");
      }
      fileSave();
    });
  }

  if (settings.includes("alikeHide"))
    document.querySelectorAll(".alikeHide")[0].click();

  if (settings.includes("alikeCurrent"))
    document.querySelectorAll(".alikeCurrent")[0].click();
}

function addDoneButton() {
  var checkExist = setInterval(function () {
    if (document.querySelectorAll("table > tbody > tr").length) {
      clearInterval(checkExist);

      const button = document.createElement("div");
      button.classList.add('alikeStatus');
      button.textContent = "Done";

      const element = document.querySelectorAll("table > tbody > tr");
      for (let i = 0; i < element.length; i++) {
        const clone = button.cloneNode(true);
        clone.onclick = function () {
          clickDoneButton(this)
        };
        const eventName = element[i].querySelector(".quest > .title span").textContent;

        //Add button and if done mark as done
        element[i].querySelector(".level").appendChild(clone);
        if (eventList.includes(eventName)) {
          element[i].classList.add('completed');
        }
      }
    }
  }, 100);
}

function clickDoneButton(button) {
  const parent = button.parentNode.parentNode;
  const eventName = parent.querySelector(".quest > .title span").textContent;

  if (parent.classList.contains('completed')) {
    parent.classList.remove('completed');
    for (var i = 0; i < eventList.length; i++) {
      if (eventList[i] === eventName) {
        eventList.splice(i, 1);
      }
    }
  } else {
    parent.classList.add('completed');
    eventList.push(eventName);
  }
  fileSave();
}

function addExportImport() {
  const buttonDownload = document.createElement("div");
  buttonDownload.classList.add('alikeExIm');
  buttonDownload.textContent = "Download Completed Event List";
  buttonDownload.onclick = function () {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(eventList));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "EventList.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    return false;
  };

  const buttonUpload = document.createElement("input");
  buttonUpload.style.display = "none";
  buttonUpload.type = "file";
  buttonUpload.id = "json-upload";
  buttonUpload.onchange = function (event) {
    let reader = new FileReader();
    reader.onload = function (event) {
      let obj = JSON.parse(event.target.result);
      for (let i = 0; i < obj.length; i++) {
        if (!eventList.includes(obj[i]))
          eventList.push(obj[i]);
      }

      fileSave();
      const element = document.querySelectorAll("table > tbody > tr");
      for (let i = 0; i < element.length; i++) {
        const eventName = element[i].querySelector(".quest > .title span").textContent;
        if (obj.includes(eventName))
          element[i].classList.add('completed');
      }
    }
    reader.readAsText(event.target.files[0]);
  }

  const buttonUploadText = document.createElement("label");
  buttonUploadText.classList.add('alikeExIm');
  buttonUploadText.for = "json-upload";
  buttonUploadText.textContent = "Upload Completed Event List";
  buttonUploadText.appendChild(buttonUpload);

  const parent = document.getElementsByClassName("buttonExIm")[0];
  parent.appendChild(buttonDownload);
  parent.appendChild(buttonUploadText);
}