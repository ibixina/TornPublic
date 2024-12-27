// ==UserScript==
// @name         racenao
// @namespace    racenao.zero.nao
// @version      0.1
// @description  race helper for torn
// @author       nao [2669774]
// @match        https://www.torn.com/loader.php?sid=racing*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/ibixina/TornPublic/main/quick-race.user.js
// @downloadURL  https://raw.githubusercontent.com/ibixina/TornPublic/main/quick-race.user.js

// ==/UserScript==
//

GM_addStyle(`
.race-button {
  color: white;
  margin: 5px;
  height: 40px;
padding: 5px !important;
border-radius: 5px;
background: #007bff !important;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

.blinking {
  animation: blink 1s infinite;
}
`);

if (!localStorage.getItem("racesNao")) {
  localStorage.setItem("racesNao", JSON.stringify({}));
}

let races = JSON.parse(localStorage.getItem("racesNao"));
let lastRaceInfo;

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

function saveRace() {
  const raceTitle = prompt(`
Race Name: ${lastRaceInfo.title}
Track: ${lastRaceInfo.trackID}
Min Drivers: ${lastRaceInfo.minDrivers}
Max Drivers: ${lastRaceInfo.maxDrivers}
Laps: ${lastRaceInfo.laps}
Min Class: ${lastRaceInfo.minClass}
Cars Type Allowed: ${lastRaceInfo.carsTypeAllowed}
Cars Allowed: ${lastRaceInfo.carsAllowed}
Bet Amount: ${lastRaceInfo.betAmount}
Wait Time: ${lastRaceInfo.waitTime}

Enter the race title:`);
  if (raceTitle) {
    races[raceTitle] = lastRaceInfo;
    localStorage.setItem("racesNao", JSON.stringify(races));
    updateRace();

    const saveButton = document.querySelector(".save-button");
    saveButton.classList.remove("blinking");
  }
}

function insert() {
  const container = document.querySelector(".content-title");

  if (!container) {
    setTimeout(insert, 1000);
    return;
  }

  const saveButton = document.createElement("button");
  saveButton.innerText = "Save";
  saveButton.className = "race-button save-button";
  saveButton.addEventListener("click", function () {
    saveRace();
  });
  container.appendChild(saveButton);

  const racesContainer = document.createElement("div");
  racesContainer.className = "races-container";
  container.appendChild(racesContainer);

  for (let raceId in races) {
    const raceName = raceId;
    const raceButton = document.createElement("button");
    raceButton.innerText = raceName;
    raceButton.className = "race-button";
    raceButton.addEventListener("click", function () {
      startRace(raceId);
    });
    raceButton.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      removeRace(raceId);
    });

    racesContainer.appendChild(raceButton);
  }
}

function updateRace() {
  const racesContainer = document.querySelector(".races-container");
  racesContainer.innerHTML = "";
  for (let raceId in races) {
    const raceName = raceId;
    const raceButton = document.createElement("button");
    raceButton.innerText = raceName;
    raceButton.className = "race-button";
    raceButton.addEventListener("click", function () {
      startRace(raceId);
    });
    raceButton.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      removeRace(raceId);
    });

    racesContainer.appendChild(raceButton);
  }
}

function removeRace(raceId) {
  delete races[raceId];
  localStorage.setItem("racesNao", JSON.stringify(races));
  updateRace();
}

function startRace(raceId) {
  const raceName = races[raceId].title;
  const minDrivers = races[raceId].minDrivers;
  const maxDrivers = races[raceId].maxDrivers;
  const trackId = races[raceId].trackID;
  const laps = races[raceId].laps;
  const minClass = races[raceId].minClass;
  const carsTypeAllowed = races[raceId].carsTypeAllowed;
  const carsAllowed = races[raceId].carsAllowed;
  const betAmount = races[raceId].betAmount;
  const waitTime = races[raceId].waitTime;
  const carId = races[raceId].carID;

  let raceLink = `https://www.torn.com/page.php?sid=racing&tab=customrace&section=getInRace&step=getInRace&id=&carID=${carId}&createRace=true&title=${raceName}&minDrivers=${minDrivers}&maxDrivers=${maxDrivers}&trackID=${trackId}&laps=${laps}&minClass=${minClass}&carsTypeAllowed=${carsTypeAllowed}&carsAllowed=${carsAllowed}&betAmount=${betAmount}&waitTime=0&rfcv=${getRFC()}`;
  $.post(raceLink, function (response) {
    console.log("Race started");
    const saveButton = document.querySelector(".save-button");
    saveButton.classList.remove("blinking");
  });
}

insert();

const originalAjax = $.ajax;
$.ajax = function (options) {
  console.log("[RACENAO] :", options);
  if (options.url.includes("sid=racing") && options.url.includes("getInRace")) {
    const requestUrl = options.url.split("step=getInRace&")[1];
    const urlPieces = requestUrl.split("&");

    lastRaceInfo = {};
    for (let piece of urlPieces) {
      const [key, value] = piece.split("=");
      lastRaceInfo[key] = value;
    }

    const saveButton = document.querySelector(".save-button");
    if (lastRaceInfo) {
      saveButton.classList.add("blinking");
    } else {
      saveButton.classList.remove("blinking");
    }
  }

  return originalAjax(options);
};
