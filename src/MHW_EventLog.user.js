// ==UserScript==
// @name        Monster Hunter World - Event Log
// @description Keep track of the Event Quest Schedule. Mark completed ones and hide them if you want.
// @author      alike03
// @version     1.0
// @namespace   MHW_EventLog
// @icon        https://raw.githubusercontent.com/alike03/Userscripts/master/assets/MHW_EventLog-Icon.png
// @supportURL  https://github.com/alike03/Userscripts/issues
// @downloadURL https://raw.githubusercontent.com/alike03/Userscripts/master/src/MHW_EventLog.user.js
// @updateURL   https://raw.githubusercontent.com/alike03/Userscripts/master/meta/MHW_EventLog.user.js
// @match       http*://game.capcom.com/world/*/schedule*.html
// @require     https://code.jquery.com/jquery-latest.js
// ==/UserScript==

let eventList = [];
let steam = "console_";
if (window.location.href.indexOf("steam") != -1)
  steam = "steam_";
let filename = steam + window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1).replace(".html", "");
let localEventList = "localEventList_" + filename;

$(window).load(function() {
  if (localStorage.getItem(localEventList) != null)
    eventList = JSON.parse(localStorage.getItem(localEventList));
  
  $('#schedule .tableArea .tableTitle').append('<div class="alikeHide alikeStatus">Hide Done Events</div>');
  $('.alikeHide').click(function() {
    if ($(this).hasClass('completed')) {
      $(this).removeClass('completed');
      $(this).parent().next().removeClass('hide');
    } else {
      $(this).addClass('completed');
      $(this).parent().next().addClass('hide');
    }
  });
  
  setTimeout(function () {
    $('table').children('tbody').children('tr').each(function () {
      
        $(this).children('.level').append('<div class="alikeStatus">Done</div>');
        
        let completeButton = $(this).find('.alikeStatus');
        let eventName = ($(this).find('.title span').text());
        if (eventList.includes(eventName)) {
          $('table tbody span:contains(' + (eventName) + ')').parent().parent().parent().addClass('completed');
        }
      
      $(completeButton).click(function() {
        let selectedEventName = $(this).parent().parent().find('.title span').text();
        if ($(this).parent().parent().hasClass('completed')) {
          $(this).parent().parent().removeClass('completed');
          let selectedEventIndex;
          while ((selectedEventIndex = eventList.indexOf(selectedEventName)) > -1) {
            eventList.splice(selectedEventIndex, 1);
          }
        } else {
          $(this).parent().parent().addClass('completed');
          eventList.push(selectedEventName);
        }
        localStorage.setItem(localEventList, JSON.stringify(eventList));
      });
    });
  }, 100);
});

let css = [
  ".alikeStatus {",
      "border: 2px solid #756b5e;",
      "padding: 5px 5px 8px;",
      "margin-top: 15px;",
      "text-shadow: 2px 2px 8px black;",
      "cursor: pointer;",
  "}",
  ".alikeHide {",
      "display: inline-block;",
      "margin: 0 0 0 10px;",
      "font-size: 1.3rem;",
      "color: #756b5e;",
  "}",
  ".alikeStatus.completed,",
  "tr.completed .alikeStatus {",
      "color: white;",
      "background: #756b5e;",
  "}",
  "#wrap table tr.completed {",
      "opacity: 0.35;",
      "-webkit-filter: grayscale(100%);",
      "filter: grayscale(100%);",
      "animation: animationComplete 1s;",
  "}",
  "#wrap table.hide tr.completed {",
    "display: none !important;",
    "animation: myfirst 2s;",
  "}",
  "@keyframes animationComplete {",
    "0%   {opacity: 1;}",
    "100% {opacity: 0.35;}",
  "}",
].join("\n");
{
  var node = document.createElement("style");
  node.appendChild(document.createTextNode(css));
  var heads = document.getElementsByTagName("head");
  if (heads.length > 0) {
    heads[0].appendChild(node);
  } else {
    document.documentElement.appendChild(node);
  }
}