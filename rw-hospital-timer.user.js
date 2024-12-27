// ==UserScript==
// @name         rw-timer
// @namespace    rw-timer.zero.nao
// @version      0.2
// @description  shows remaining hospital time in rw
// @author       nao [2669774]
// @match        https://www.torn.com/factions.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ibixina/TornPublic/main/rw-hospital-timer.user.js
// @downloadURL  https://raw.githubusercontent.com/ibixina/TornPublic/main/rw-hospital-timer.user.js

// ==/UserScript==

if (!localStorage.getItem("api_nao")) {
  const api = prompt("Please enter your api key: ");
  const response = await $.getJSON(
    `https://api.torn.com/user/?selections=&key=${api}`,
  );
  if (response.error) {
    alert("Invalid API key");
    return;
  }
  alert("API key set");
  localStorage.setItem("api_nao", api);
}

let api = localStorage.getItem("api_nao");
const interval = 10;
let url = window.location.href;
let rfc = getRFC();

let timethreshold = 5;

let userData = {};

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

async function getFactionData(id) {
  let checked = [];
  $(
    "a[href^='/factions.php?step=profile&ID=']",
    $("div[class^='rankBox']"),
  ).each(async function () {
    const factionId = $(this).attr("href").split("ID=")[1];
    console.log(factionId);
    if (checked.includes(factionId)) {
      return;
    }

    const url = `https://api.torn.com/faction/${factionId}?selections=&key=${api}`;
    const response = await $.getJSON(url);
    checked.push(factionId);

    for (const member in response.members) {
      const memberData = response.members[member];
      console.log("Member:", member, typeof member);
      userData[String(member)] = memberData.status.until;
    }
    updatetimeData();
  });
}

function updatetimeData() {
  $(".hospital").each(function () {
    const parent = $(this).parent();
    const link = $("a[href^='/profiles.php?XID=']", parent);
    if (link.length == 0) {
      return;
    }
    const id = String($(link).attr("href").split("XID=")[1]);

    if (Object.keys(userData).includes(id)) {
      if (!$(this).hasClass("timer")) {
        $(this).addClass("timer");
      }
      $(this).attr("timer", Math.round(userData[id] - Date.now() / 1000));
    } else {
      console.log("No data for " + id);
    }
  });
}

function updateTimer() {
  $(".timer").each(function () {
    let currentTime = $(this).attr("timer");
    let newTime = Math.max(0, currentTime - 1);

    if (newTime < timethreshold * 60 && newTime > 0) {
      $(this).parent().css("background", "rgba(32, 64, 125, 0.5)");
    }
    if (newTime == 0) {
      $(this).parent().css("background", "rgba(32, 64, 125, 0)");
    }

    $(this).attr("timer", newTime);

    $(this).text(convertTime(newTime));
  });
}

function convertTime(time) {
  let hours = Math.floor(time / 3600);
  time = time % 3600;
  let minutes = Math.floor(time / 60);
  time = time % 60;
  let seconds = time;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return `${hours}:${minutes}:${seconds}`;
}

function main() {
  if ($(".m-right10").length == 0) {
    setTimeout(main, 1000);
    return;
  }
  getFactionData();
  setTimeout(getFactionData, interval * 1000);
  setInterval(updateTimer, 1000);
}

main();
