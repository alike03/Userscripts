// ==UserScript==
// @name        YouTube Docking
// @description Read the comments while watching the video
// @author      alike03
// @version     3.0.6
// @namespace   youtubeDOCK
// @icon        https://raw.githubusercontent.com/alike03/Userscripts/master/assets/YouTubeDocking-Icon.png
// @supportURL  https://github.com/alike03/Userscripts/issues
// @downloadURL https://raw.githubusercontent.com/alike03/Userscripts/master/src/YouTubeDocking.user.js
// @updateURL   https://raw.githubusercontent.com/alike03/Userscripts/master/meta/YouTubeDocking.user.js
// @match       https://*.youtube.com/*
// @require     https://code.jquery.com/jquery-3.5.0.slim.min.js
// @noframes
// ==/UserScript==

let save = {};
let playerDocked = false;
let trackPlayer = false;

window.addEventListener("yt-navigate-start", deactivate);
window.addEventListener("yt-navigate-finish", yt_navigate_finish);
window.addEventListener("DOMContentLoaded", boot);

function boot() {
  loadSettings();
  addPlayerSize(true);
  addCSS();
  addSettings();
}

function loadSettings() {
  if (localStorage.getItem("youtubeDOCK") != null) {
    save = JSON.parse(localStorage.getItem("youtubeDOCK"));
  }

  let saveTemp = {
    size: {
      width: 533,
      height: 300,
      distance: 20,
      small: false
    },
    version: '3.0.6'
  }
  
  if (isNewerVersion(save.version, saveTemp.version)) {
    save.version = saveTemp.version;
    alert("Update " + saveTemp.version + " for YouTube Docking is installed \nsee the changes in the Settings top right corner.");
    localStorage.setItem("youtubeDOCK", JSON.stringify(save));
  }

  fillObject(saveTemp, save);
}

function isNewerVersion (oldVer, newVer) {
  let oldParts = ((oldVer === undefined || oldVer === null) ? 0 : oldVer.split('.'));
  let newParts = newVer.split('.');
  for (var i = 0; i < newParts.length; i++) {
    let a = parseInt(newParts[i]) || 0;
    let b = parseInt(oldParts[i]) || 0;
    if (a > b) 
      return true;
    if (a < b) 
      return false;
  }
  return false;
}

function fillObject(from, to) {
  for (var key in from) {
    if (from.hasOwnProperty(key)) {
      if (Object.prototype.toString.call(from[key]) === '[object Object]') {
        if (!to.hasOwnProperty(key)) {
          to[key] = {};
        }
        fillObject(from[key], to[key]);
      } else if (!to.hasOwnProperty(key)) {
        to[key] = from[key];
      }
    }
  }
}

function yt_navigate_finish() {
  if (window.location.href.indexOf('youtube.com/watch?v=') > -1) {
    if (!trackPlayer) start_tracking();
    hijackResize();
  } else if (trackPlayer) {
    if (trackPlayer) stop_tracking();
  }
}

function start_tracking() {
  trackPlayer = true;
  window.addEventListener("scroll", scrolling);
}

function stop_tracking() {
  trackPlayer = false;
  window.removeEventListener("scroll", scrolling);
}

function activate() {
  if (!playerDocked) {
    $("#movie_player").addClass("alike");
    window.dispatchEvent(new Event('resize'));
    playerDocked = true;
  }
}

function deactivate() {
  if (playerDocked) {
    $("#movie_player").removeClass("alike");
    window.dispatchEvent(new Event('resize'));
    playerDocked = false;
  }
}

function addPlayerSize(boot, playerWidth = 533, playerHeight = 300, distance = 20) {
  if (boot) {
    playerWidth = save.size.width;
    playerHeight = save.size.height;
    distance = save.size.distance;
  } else {
    $("#alikeStyle").remove();
    save.size.width = playerWidth;
    save.size.height = playerHeight;
    save.size.distance = distance;
    localStorage.setItem("youtubeDOCK", JSON.stringify(save));
  }

  let style = document.createElement('style');
  style.setAttribute("id", "alikeStyle");
  style.innerHTML = `
    #movie_player.alike:not(.ytp-fullscreen) {
      width: ` + playerWidth + `px;
      height: ` + playerHeight + `px;
      margin: ` + distance + `px;
    }
  `;
  document.head.appendChild(style);
  window.dispatchEvent(new Event('resize'));
}

function addCSS() {
  let style = document.createElement('style');
  style.innerHTML = `
    #movie_player.alike:not(.ytp-fullscreen) {
      position: fixed;
      bottom: 0;
      right: 0;
      z-index: 1337;
      box-shadow: 0px 0px 25px 3px black;
      box-shadow: var(--shadow-elevation-16dp_-_box-shadow);
      background: black;
    }
    #alikeButton {
      width: 30px;
      height: 30px;
      margin-right: 15px;
    }
    #alikeButton svg {
      cursor: pointer;
    }

    #alikeSettings {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 3003;
      background: var(--paper-dialog-background-color, var(--primary-background-color));
      color: var(--paper-dialog-color, var(--primary-text-color));
      font-family: var(--paper-font-body1_-_font-family);
      -webkit-font-smoothing: var(--paper-font-body1_-_-webkit-font-smoothing);
      font-size: var(--paper-font-body1_-_font-size);
      font-weight: var(--paper-font-body1_-_font-weight);
      line-height: var(--paper-font-body1_-_line-height);
      box-shadow: var(--shadow-elevation-16dp_-_box-shadow);
    }
    #alikeSettings a,
    #alikeSettings a:visited,
    #alikeSettings a:hover {
      color: var(--yt-spec-text-primary);
    }
    #alikeSettings .alike-header,
    #alikeSettings .alike-footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }
    #alikeSettings .alike-footer {
      opacity: 0.6;
      font-size: 85%;
      border: none;
    }
    #alikeSettings .alike-break {
      border-bottom: 1px solid var(--yt-spec-10-percent-layer);
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    #alikeSettings yt-icon-button.ytd-alike-settings {
      color: var(--yt-spec-icon-inactive);
    }
    #alikeSettings yt-icon-button.ytd-alike-settings:hover {
      color: var(--yt-spec-icon-active-other);
    }
    #alikeSettings > div {
      color: var(--yt-spec-text-primary);
      cursor: pointer;
      margin: 0 30px 20px;
      user-select: none;
    }
    #alikeSettings .alike-input-box {
      height: 42px;
      margin: 30px;
      justify-content: space-between;
      border: 1px solid var(--yt-std-surface-400);
      background-color: var(--yt-std-surface-200);
      border-radius: 2px;
      display: var(--layout_-_display);
      -ms-flex-align: var(--layout-center_-_-ms-flex-align);
      -webkit-align-items: var(--layout-center_-_-webkit-align-items);
      align-items: var(--layout-center_-_align-items);
    }
    #alikeSettings .alike-input-box > * {
      color: var(--yt-spec-text-primary);
      margin-left: var(--ytd-margin-4x);
    }
    #alikeSettings .alike-input-box > *:last-child {
      margin-right: var(--ytd-margin-4x);
    }
    #alikeSettings .alike-input-box input {
      margin: 0 0 0 var(--ytd-margin-4x);
      border: none;
      overflow: hidden;
      white-space: nowrap;
      background-color: rgba(0, 0, 0, 0);
      font-size: var(--paper-font-body1_-_font-size);
      -webkit-appearance: none;
      -moz-appearance: textfield;
    }
    #alikeSettings #checkbox > div {
      margin: auto;
    }

    ytd-watch-flexy:not(.alikeSmall) #columns #movie_player.alike:not(.ytp-fullscreen) video,
    ytd-watch-flexy:not(.alikeSmall) #columns #movie_player.alike:not(.ytp-fullscreen) .html5-video-container {
      display: block;
      width: 100% !important;
      height: 100% !important;
      top: 0 !important;
      left: 0 !important;
    }

    #columns #movie_player.alike > * {
      display: none;
    }
    .alikeSmall .ytp-size-button {
      display: none !important;
    }
    .alikeSmall:not([fullscreen]) #player.ytd-watch-flexy,
    .alikeSmall:not([fullscreen]) #colmuns #player-container-inner {
      display: block;
    }
    .alikeSmall:not([fullscreen]) #columns #player {
      padding-top: var(--ytd-margin-6x);
    }
    .alikeSmall:not([fullscreen]) #player-theater-container {
      position: absolute !important;
      position: absolute;
      margin-top: var(--ytd-margin-6x);
      z-index: 1337;
    }
  `;
  document.head.appendChild(style);
}

function hijackResize_OLD() {
  if (save.size.small) {
    if (!$("#page-manager ytd-watch-flexy").is('[theater]')) {
      $("#page-manager ytd-watch-flexy").attr("theater", "");
      $("#page-manager ytd-watch-flexy").attr("theater-requested_", "");
    }

    let checkExistTM = setInterval(function () {
      if ($('#player-theater-container #player-container').length) {
        $("ytd-watch-flexy.ytd-page-manager").addClass('alikeSmall');
        $("#player-theater-container #player-container").appendTo($("#columns #player-container-inner"));
        window.dispatchEvent(new Event('resize'));
        clearInterval(checkExistTM);
      }
    }, 100);
  } else {
    let checkExistNM = setInterval(function () {
      if ($('#columns #player-container').length) {
        //$("#page-manager ytd-watch-flexy").removeAttr("theater").removeAttr("theater-requested_");
        $("ytd-watch-flexy.ytd-page-manager").removeClass('alikeSmall');
        $("#columns #player-container").appendTo($("#player-theater-container"));
        window.dispatchEvent(new Event('resize'));
        clearInterval(checkExistNM);
      }
    }, 100);
  }
}

function hijackResize() {
  if (save.size.small) {
    if (!$("#page-manager ytd-watch-flexy").is('[theater]')) {
      $("#page-manager ytd-watch-flexy").attr("theater", "");
      $("#page-manager ytd-watch-flexy").attr("theater-requested_", "");
    }

    $("ytd-watch-flexy.ytd-page-manager").addClass('alikeSmall');
    window.addEventListener('resize', smallPlayerSize);
    window.addEventListener("yt-navigate-finish", smallPlayerSize);
  } else {
    $("ytd-watch-flexy.ytd-page-manager").removeClass('alikeSmall');
    window.removeEventListener('resize', smallPlayerSize);
    window.removeEventListener("yt-load-finish", smallPlayerSize);
  }
  smallPlayerSize();
  window.dispatchEvent(new Event('resize'));
}

function smallPlayerSize() {
  let checkExistST = setInterval(function () {
    if ($('ytd-watch-flexy.hide-skeleton').length) {
      $("#alikeStyleSmall").remove();
      //playerHeight = padding-top: calc(var(--ytd-watch-flexy-height-ratio) / var(--ytd-watch-flexy-width-ratio) * 100%);
      let playerWidth = $("#columns #player").width();
      let playerHeight = $("#columns #player").height();
      //playerWidth = playerHeight * 1.777;
      let playerLeft = $("#columns #player").offset().left;

      let style = document.createElement('style');
      style.setAttribute("id", "alikeStyleSmall");
      style.innerHTML = `
        .alikeSmall:not([fullscreen]) #player-theater-container {
          width: ` + playerWidth + `px !important;
          height: ` + playerHeight + `px !important;
          left: ` + playerLeft + `px;
        }
      `;
      document.head.appendChild(style);
      clearInterval(checkExistST);
    }
  })
}

function addSettings() {
  //TODO: Add Ripple Effect

  let icon = '<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z" fill="var(--yt-spec-icon-active-other)" id="ytp-id-23"></path></svg>';
  let checkExistH = setInterval(function () {
    if ($('#masthead #end').length) {
      $("#masthead #end").prepend('<div id="alikeButton">' + icon + '</div>');
      $("#alikeButton svg").on("click", openSettings);
      clearInterval(checkExistH);
    }
  }, 100);
}

function openSettings() {
  let closeButton = '<yt-icon-button id="close-button" class="style-scope ytd-alike-settings"><button id="button"class="style-scope yt-icon-button" aria-label="Abbrechen"><yt-icon icon="close" class="style-scope ytd-alike-settings"><svg viewBox="0 0 24 24"preserveAspectRatio="xMidYMid meet" focusable="false"style="pointer-events: none; display: block; width: 100%; height: 100%;"class="style-scope yt-icon"><g class="style-scope yt-icon"><pathd="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"class="style-scope yt-icon"></path></g></svg></yt-icon></button></yt-icon-button>';
  let title = '<div class="alike-header alike-break"><span>YouTube Docking</span>' + closeButton + '</div>';
  let footer = '<div class="alike-footer"><div><span>v' + save.version + ' - </span><a target="_blank" href="https://github.com/alike03/Userscripts/blob/master/docs/YouTubeDocking.md">Changelog</a></div><div><a target="_blank" href="https://github.com/alike03/Userscripts/issues">Report Issue</a></div></div>';
  let width = '<div class="alike-input-box size"><label for="width">Width:</label><input id="width" size="6" type="number" min="0" max="9999"><span>px</span></div>';
  let height = '<div class="alike-input-box size"><label for="height">Height:</label><input id="height" size="6" type="number" min="0" max="9999"><span>px</span></div>';
  let distance = '<div class="alike-input-box size"><label for="distance">Distance:</label><input id="distance" size="6" type="number" min="0" max="9999"><span>px</span></div>';
  let reset = '<div class="alike-reset alike-break">Reset to the default size</div>';
  let smallP = '<div class="alike-small alike-break"><paper-checkbox id="checkbox" class="style-scope ytd-playlist-add-to-option-renderer" role="checkbox" tabindex="0" toggles="" aria-checked="false" aria-disabled="false" style="--paper-checkbox-ink-size:54px;">Simulate default view mode<br>to enable docked controls (Alpha)</paper-checkbox></div>';

  //TODO: Animate Transition
  $("body").append('<iron-overlay-backdrop style="z-index: 3000;" opened="" class="opened"></iron-overlay-backdrop>');
  $("body").append('<div id="alikeSettings">' + title + width + height + distance + reset + smallP + footer + '</div>');

  $("#alikeSettings #width").val(save.size.width);
  $("#alikeSettings #height").val(save.size.height);
  $("#alikeSettings #distance").val(save.size.distance);
  if (save.size.small) $("#alikeSettings .alike-small #checkbox").attr("active", "");
  listenSettings();
}

function listenSettings() {
  $("#alikeSettings #close-button, body iron-overlay-backdrop").on("click", closeSettings);

  $("#alikeSettings .alike-reset").on("click", function () {
    addPlayerSize(false);
    $("#alikeSettings #width").val(save.size.width);
    $("#alikeSettings #height").val(save.size.height);
    $("#alikeSettings #distance").val(save.size.distance);
  });

  $("#alikeSettings .alike-small paper-checkbox").on("click", function () {
    if ($(this)[0].hasAttribute("checked"))
      save.size.small = true;
    else
      save.size.small = false;

    hijackResize();
    localStorage.setItem("youtubeDOCK", JSON.stringify(save));
  });

  $('#alikeSettings .size input').keydown(function (event) {
    if (!(event.ctrlKey || event.altKey
                        || (47<event.keyCode && event.keyCode<58 && event.shiftKey==false) 
                        || (95<event.keyCode && event.keyCode<106)
                        || (event.keyCode==8) || (event.keyCode==9) 
                        || (event.keyCode>34 && event.keyCode<40) 
                        || (event.keyCode==46)))
    return false;
  });
  $('#alikeSettings .size input').keyup(function (e) {
    if ($(this).val() < 9999 && $(this).val() > 0) {
      addPlayerSize(false, $("#alikeSettings #width").val(), $("#alikeSettings #height").val(), $("#alikeSettings #distance").val());
    }
  });
}

function closeSettings() {
  $("body iron-overlay-backdrop, body #alikeSettings").remove();
}

function scrolling() {
  let limiter = $("#player-container #ytd-player");
  let top_of_element = $(limiter).offset().top;
  let bottom_of_element = $(limiter).offset().top + $(limiter).outerHeight();
  let bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
  let top_of_screen = $(window).scrollTop();

  if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
    deactivate();
  } else {
    activate()
  }
}