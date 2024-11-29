// ==UserScript==
// @name         travel-timer
// @namespace    travel-timer.zero.nao
// @version      0.1
// @description  travel timer and alert
// @author       nao [2669774]
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    <UPDATE_URL>
// @downloadURL  <DOWNLOAD_URL>

// ==/UserScript==

let api = "";

let url = window.location.href;
let rfc = getRFC();
let secondsLeft = 0;
const updateTime = 1;

const travelUrl = `https://api.torn.com/user/?selections=travel&key=${api}`;
let alerted = false;

let timer;

const alertSound = new Audio();
alertSound.src =
  "https://upload.wikimedia.org/wikipedia/commons/4/42/Beep_alarm_clock.ogg";

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

function insert() {
  if ($("#tcLogo").length == 0) {
    setTimeout(insert, 1000);
    return;
  }

  let timerContainer = document.createElement("div");
  timerContainer.className = "timer-container";
  timerContainer.style.position = "absolute";
  timerContainer.style.top = "0px";
  timerContainer.style.left = "0px";
  timerContainer.style.width = "100%";
  timerContainer.style.height = "100%";
  timerContainer.style.background = "rgba(0,0,0,0.5)";
  timerContainer.style.display = "flex";
  timerContainer.style.flexDirection = "row";
  timerContainer.style.fontSize = "60px";
  timerContainer.style.color = "white";

  let hourDiv = document.createElement("div");
  hourDiv.id = "hour";
  hourDiv.style.flex = "1";
  hourDiv.style.display = "flex";
  hourDiv.style.justifyContent = "center";
  hourDiv.style.alignItems = "center";

  let minuteDiv = document.createElement("div");
  minuteDiv.id = "minute";
  minuteDiv.style.flex = "1";
  minuteDiv.style.display = "flex";
  minuteDiv.style.justifyContent = "center";
  minuteDiv.style.alignItems = "center";

  timerContainer.appendChild(hourDiv);
  timerContainer.appendChild(minuteDiv);

  $("#tcLogo").append(timerContainer);

  timer = setInterval(update, 1000);
  getTravel();
}

function update() {
  secondsLeft = Math.max(0, secondsLeft - 1);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (secondsLeft <= 0) {
    clearInterval(timer);
    $(".timer-container").css("display", "none");
    return;
  }

  if (secondsLeft <= 20) {
    $(".timer-container").css("color", "red");
    if (alerted == false) {
      playAlertSound();
      alerted = true;
    }
  }

  $("#hour").html(minutes);
  $("#minute").html(seconds);

  if (minutes < 10) {
    $("#hour").html("0" + minutes);
  }
  if (seconds < 10) {
    $("#minute").html("0" + seconds);
  }
}

function playAlertSound() {
  alertSound.volume = 0.5;
  alertSound.play().catch((error) => {
    console.error("Error playing alert sound:", error);
  });
}

async function getTravel() {
  let response = await $.getJSON(travelUrl);
  secondsLeft = response.travel.time_left;
  setTimeout(getTravel, 60000 * updateTime);
}

insert();
