// ==UserScript==
// @name        YouTube Docking
// @description Read the comments while watching the video
// @author      alike03
// @version     2.0.4
// @namespace   youtubeDOCK
// @icon        https://raw.githubusercontent.com/alike03/Userscripts/master/assets/youtube.png
// @supportURL  https://github.com/alike03/Userscripts/issues
// @downloadURL https://raw.githubusercontent.com/alike03/Userscripts/master/src/YouTubeDocking.user.js
// @updateURL   https://raw.githubusercontent.com/alike03/Userscripts/master/meta/YouTubeDocking.user.js
// @match       *://*.youtube.com/*
// @require     https://code.jquery.com/jquery-latest.js
// ==/UserScript==

let playerWidth = "533px";
let playerHeight = "300px";

let miniPlayerEnabled = false;
let miniplayerStatus = false;
let miniplayerBlock = false;
let fullscreen = false;

window.addEventListener("yt-navigate-start", disableMiniPlayer);
window.addEventListener("yt-navigate-finish", start);
window.addEventListener("load", addCSS);

function addCSS() {
  let css = [
    ".alikeMini {",
    "position: fixed;",
    "bottom: 20px;",
    "right: 20px;",
    "width: " + playerWidth + ";",
    "height: " + playerHeight + ";",
    "z-index: 3;",
    "box-shadow: 0px 0px 25px 3px black;",
    "background: black;",
    "}",
    ".alikeVideo {",
    "width: 100% !important;",
    "height: 100% !important;",
    "top: 0 !important;",
    "left: 0 !important;",
    "}",
  ].join("\n"); {
    let node = document.createElement("style");
    node.appendChild(document.createTextNode(css));
    let heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      document.documentElement.appendChild(node);
    }
  }
}


function start() {
  if (window.location.href.indexOf('youtube.com/watch?v=') > -1) {
    let targetNode = $('#movie_player');
    observer.observe(targetNode[0], config);
    window.addEventListener('resize', fixVidSize);
    window.addEventListener("scroll", scrolling);
  } else {
    if (miniPlayerEnabled === true) {
      disableMiniPlayer();
    }
    observer.disconnect();
    window.removeEventListener('resize', fixVidSize);
    window.removeEventListener("scroll", scrolling);
  }
}

function scrolling() {
  if (miniplayerBlock === false) {
    let limiter = $("#columns #alerts");
    let top_of_element = $(limiter).offset().top;
    let bottom_of_element = $(limiter).offset().top + $(limiter).outerHeight();
    let bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
    let top_of_screen = $(window).scrollTop();

    if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
      miniplayerEnabled = false;
    } else {
      miniplayerEnabled = true;
    }
    check();
  }
}

function check() {
  if (miniplayerEnabled === true && miniplayerStatus === false && miniplayerBlock === false) {
    miniplayerStatus = true;
    activateMiniPlayer();
  }
  if (miniplayerBlock === true || (miniplayerEnabled === false && miniplayerStatus === true)) {
    miniplayerStatus = false;
    disableMiniPlayer();
  }
}

function activateMiniPlayer() {
  if (miniPlayerEnabled === false) {
    let checkExist = setInterval(function () {
      if ($("ytd-player").length) {
        clearInterval(checkExist);
        //move player
        $("ytd-player").addClass("alikeMini");

        $("#movie_player .ytp-chrome-bottom .ytp-progress-bar").on("mouseover", blockClick);
        $("#movie_player .ytp-chrome-bottom .ytp-progress-bar").on("mousedown", blockClick);
        $("#movie_player .ytp-chrome-bottom .ytp-scrubber-container").css("display", "none");
        $("#movie_player .ytp-chrome-bottom .ytp-size-button").css("display", "none");
        $("#movie_player").removeClass(".ytp-large-width-mode .ad-created");
        miniPlayerEnabled = true;
        fixVidSize();
      }
    }, 100);
  }
}


function disableMiniPlayer() {
  if (miniPlayerEnabled === true) {
    miniPlayerEnabled = false;
    $("ytd-player").removeClass("alikeMini");

    $("#movie_player .ytp-chrome-bottom .ytp-progress-bar").off("mouseover", blockClick);
    $("#movie_player .ytp-chrome-bottom .ytp-progress-bar").off("mousedown", blockClick);
    $("#movie_player .ytp-chrome-bottom .ytp-scrubber-container").css("display", "");
    $("#movie_player .ytp-chrome-bottom .ytp-size-button").css("display", "");
    $("#movie_player").addClass(".ytp-large-width-mode .ad-created");
    fixVidSize();
  }
}

function blockClick(event) {
  event.stopPropagation();
  event.preventDefault();
  event.stopImmediatePropagation();
  return false;
}

function fixVidSize() {
  if (miniPlayerEnabled) {
    $("#movie_player .html5-video-container").addClass("alikeVideo");
    $("#movie_player video").addClass("alikeVideo");
    $("#movie_player .ytp-chrome-bottom").css("width", "calc(100% - 24px)");
  } else {
    $("#movie_player .html5-video-container").removeClass("alikeVideo");
    $("#movie_player video").removeClass("alikeVideo");
    let spacing = 24;
    if (fullscreen)
      spacing *= 2;
    $("#movie_player .ytp-chrome-bottom").css("width", $("#movie_player").width() - spacing);
  }
}

const config = {
  attributes: true,
  childList: false,
  subtree: false,
  attributeFilter: ['class']
};

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
  for (let mutation of mutationsList) {
    if (mutation.attributeName === "class") {
      var classList = mutation.target.className;
      if (classList.includes("ended-mode") || classList.includes("ytp-fullscreen")) {
        miniplayerBlock = true;
        miniplayerEnabled = false;
        fullscreen = true;
        check();
      } else if (!classList.includes("ytp-fullscreen") && !classList.includes("ended-mode")) {
        miniplayerBlock = false;
        fullscreen = false;
        check();
      }
      fixVidSize();
    }
  }
};

const observer = new MutationObserver(callback);