// ==UserScript==
// @name         hide-bounties
// @namespace    hide-bounties.zero.nao
// @version      0.1
// @description  hide unavailable bounties
// @author       nao [2669774]
// @match        https://www.torn.com/bounties.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none

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

function hide() {
  if ($(".bounties-list > li").length == 0) {
    setTimeout(hide, 1000);
    return;
  }
  $(".bounties-list > li").each(function () {
    const status = $(".status", $(this)).text();
    if (
      status.includes("Hospital") ||
      status.includes("Travel") ||
      status.includes("Abroad")
    ) {
      $(this).remove();
    }
  });
}

hide();
$(window).on("hashchange", function (e) {
  setTimeout(hide, 500);
});

$(window).keyup(function (e) {
  url = window.location.href;
  const nurl = "https://www.torn.com/bounties.php#/!p=main&start=";
  var key = e.which;
  let page = 0;
  if (url.includes("start=")) {
    page = url.split("start=")[1];
  } else {
    page = 0;
  }
  if (key == 39) {
    // the enter key code or right arrow
    window.location.href = nurl + (page * 1 + 20);
  } else if (key == 37) {
    // left arrow
    if (page == "0.0") {
      page = 0;
    } else if (page == 0) {
      page = "0.0";
    } else {
      page = Math.max(page - 20, 0);
    }
    window.location.href = nurl + page;
  }
});
