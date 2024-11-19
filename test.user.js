// ==UserScript==
// @name         testing
// @namespace    testing.zero.nao
// @version      0.1
// @description  try to tke over the world!
// @author       nao [2669774]
// @match        https://www.torn.com*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ibixina/TornPublic/main/test.user.js
// @downloadURL  https://raw.githubusercontent.com/ibixina/TornPublic/main/test.user.js

// ==/UserScript==

let api = "";
let url = window.location.href;
let rfc = getRFC();

function getRFC() {
  var rfc = $.cookie("rfc_v");
  if (!rfc) {
    var cookies = document.cookie.split("; ");
    for (var i in cookies) {
      var cookie = cookies[i].split("=");
      if (cookie[0] == "rfc_v") {
        return cookie[1];
      }
    }
  }
  return rfc;
}

console.log("test");
