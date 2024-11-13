// ==UserScript==
// @name         target-finder
// @namespace    target-finder.zero.nao
// @version      0.1
// @description  target finder modified
// @author       nao [2669774]
// @match        https://www.torn.com*
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

async function getTargets() {
  const response = await $.getJSON("https://yata.yt/api/v1/targets/export", {
    key: api,
  });
  return Object.keys(response.targets);
}

(function () {
  "use strict";

  // These are faction IDs, listed in priority order
  // If no live target is found in the first one on the list, it moves on to the next
  // The current list includes Insignia + Med-Evil factions
  let facIDs = [
    50231, 50157, 50586, 50498, 51275, 50597, 51684, 50994, 51668, 50664, 50194,
    50186, 52471, 50103, 51562, 51612, 50406, 51313, 50273, 50375, 50272, 50386,
    50328, 50401, 50216, 51145, 50433, 50094, 52528, 52442, 51382, 52377, 52429,
    52445, 52378, 48264,
  ];

  let maxLevel, apiKey, attackLink, newTab, randTarget, randFaction;
  init();

  function init() {
    maxLevel = localStorage.getItem("FTF_LEVEL") || 100;
    apiKey = localStorage.getItem("FTF_API") || null;
    attackLink = localStorage.getItem("FTF_PROFILE") === "true"; // Default to opening profile
    newTab = localStorage.getItem("FTF_NEWTAB") === "true"; // Default to opening in new tab
    randFaction = localStorage.getItem("FTF_RAND_FACTION") === "true";
    randTarget = localStorage.getItem("FTF_RAND_TARGET") === "true";
  }

  // Prompt the user to enter their API key
  function promptAPIKey() {
    const key = prompt("Enter a public API key here:");
    if (key && key.trim() !== "") {
      localStorage.setItem("FTF_API", key);
      init();
    } else {
      alert("No valid API key entered!");
    }
  }

  function changeSettings() {
    const newApiKey = document.querySelector("#ftf-api").value;
    const newLevel = document.querySelector("#ftf-max-level").value;
    const newProfile = document.querySelector("#ftf-profile").checked;
    const newNewTab = document.querySelector("#ftf-newtab").checked;
    const newRandFaction = document.querySelector(
      "#ftf-random-faction",
    ).checked;
    const newRandTarget = document.querySelector("#ftf-random-target").checked;

    localStorage.setItem("FTF_PROFILE", newProfile);
    localStorage.setItem("FTF_NEWTAB", newNewTab);
    localStorage.setItem("FTF_RAND_FACTION", newRandFaction);
    localStorage.setItem("FTF_RAND_TARGET", newRandTarget);

    if (newApiKey && newApiKey.trim() !== "") {
      localStorage.setItem("FTF_API", newApiKey);
    } else {
      alert("Invalid API key entered!");
      return;
    }

    if (newLevel >= 0 && newLevel <= 100) {
      localStorage.setItem("FTF_LEVEL", newLevel);
    } else {
      alert("Invalid max level, please enter a value between 0 and 100!");
      return;
    }

    init();
    alert("Settings saved!");
  }

  // Function to process each URL
  function processUrls(index = 0, checked = new Set()) {
    if (!apiKey) promptAPIKey();

    if (checked.size >= facIDs.length) {
      alert("No players met the conditions (or API key is invalid).");
      return;
    }

    if (randFaction) {
      do {
        index = Math.floor(Math.random() * facIDs.length);
      } while (checked.has(index));
    }

    checked.add(index);

    const url = `https://api.torn.com/faction/${facIDs[index]}?selections=basic&timestamp=${Date.now()}&key=${apiKey}`;
    console.log(url);
    //console.log(`[${Date.now()}] Checking faction ID: ${facIDs[index]}`);

    GM_xmlhttpRequest({
      method: "GET",
      url,
      onload(response) {
        const roster = JSON.parse(response.responseText);
        const target = checkCondition(roster);

        if (target) {
          let profileLink;

          if (attackLink)
            profileLink = `https://www.torn.com/loader.php?sid=attack&user2ID=${target}`;
          else profileLink = `https://www.torn.com/profiles.php?XID=${target}`;

          if (newTab) {
            window.open(profileLink, "_blank");
          } else {
            window.location.href = profileLink;
          }
        } else {
          processUrls(index + 1);
        }
      },
      onerror() {
        console.log(`Error loading URL: ${url}`);
        processUrls(index + 1, checked);
      },
    });
  }

  // Condition to check on each response
  function checkCondition(roster) {
    const targets = roster.filter((userId) => {
      const member = roster.members[userId];
      return (
        member.level <= maxLevel &&
        member.status.state === "Okay" &&
        member.days_in_faction >= 15
      );
    });

    if (targets.length === 0) return null;

    if (randTarget) {
      const index = Math.floor(Math.random() * targets.length);
      return targets[index];
    }

    return targets[0];
  }

  // Create buttons
  const raidBtn = createButton("Raid", "ftf-btn", () => processUrls());
  const settBtn = createButton("Settings", "ftf-settings", toggleSettings);

  const settDiv = createDiv("ftf-settings-container");
  settDiv.append(settBtn);
  const container = createDiv("ftf-container");
  container.append(raidBtn, settDiv);

  document.body.appendChild(container);

  function toggleSettings() {
    const container = document.getElementsByClassName(
      "ftf-settings-container",
    )[0];
    if (!container.classList.contains("ftf-settings-container-expanded")) {
      container.classList.toggle("ftf-settings-container-expanded");
      document.querySelector(".ftf-settings").textContent = "Close Settings";

      const appendElements = (parent, ...elements) => {
        const tempDiv = document.createElement("div");
        tempDiv.classList.add("temp-div");
        elements.forEach((el) => tempDiv.append(el));
        parent.append(tempDiv);
      };

      // Create and append settings
      const { input: apiKeyInput, label: apiKeyLabel } = createInput(
        "ftf-api",
        "API Key (Public)",
        apiKey,
        "text",
      );
      appendElements(container, apiKeyLabel, apiKeyInput);

      const { input: maxInput, label: maxLabel } = createInput(
        "ftf-max-level",
        "Max Level (0-100)",
        maxLevel,
        "number",
      );
      appendElements(container, maxLabel, maxInput);

      const { checkbox: profileCheckbox, label: profileLabel } = createCheckbox(
        "ftf-profile",
        "Open directly to attack page?",
        attackLink,
      );
      appendElements(container, profileLabel, profileCheckbox);

      const { checkbox: tabCheckbox, label: tabLabel } = createCheckbox(
        "ftf-newtab",
        "Open in new tab?",
        newTab,
      );
      appendElements(container, tabLabel, tabCheckbox);

      const { checkbox: randomFCheckbox, label: randomFLabel } = createCheckbox(
        "ftf-random-faction",
        "Switch to random faction?",
        randFaction,
      );
      appendElements(container, randomFLabel, randomFCheckbox);

      const { checkbox: randomTCheckbox, label: randomTLabel } = createCheckbox(
        "ftf-random-target",
        "Switch to random targets?",
        randTarget,
      );
      appendElements(container, randomTLabel, randomTCheckbox);

      const saveBtn = createButton("Save", "ftf-save", changeSettings);
      container.append(saveBtn);
    } else {
      container.classList.toggle("ftf-settings-container-expanded");
      document.querySelector(".ftf-settings").textContent = "Settings";

      while (container.children.length > 1) {
        container.removeChild(container.lastChild);
      }
      // remove the rest of the stuff that is added
    }
  }

  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName("head")[0];
    if (!head) {
      return;
    }
    style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = css;
    head.appendChild(style);
  }

  addGlobalStyle(`
            .ftf-btn, .ftf-save {
                background-color: green;
                color: white;
                border: 1px solid white;
                padding: 3px;
                border-radius: 3px;
                cursor: pointer;
            }
            .ftf-settings {
                padding: 3px;
                cursor: pointer;
                border: 1px solid white;
                border-radius: 3px;
            }
            .ftf-container {
                align-items: end;
                display: flex;
                flex-direction: column;
                gap: 3px;
                position: fixed;
                top: 30%;
                right: 0;
                z-index: 9999;
                background-color: transparent;
            }
            .ftf-settings-container {
               color: black;
               display: flex;
               flex-direction: column;
               align-items: flex-start;
               background-color: orange;
               border-radius: 3px;
            }
            .ftf-settings-container-expanded {
               width: 200px;
               height: fit-content;
               border: 1px solid white;
               align-items: center;
               justify-content: flex-start;
               gap: 2px;
            }
            #ftf-api, #ftf-max-level { width:100px ; text-align: center }
            .temp-div { display:flex; }
        `);

  function createButton(text, className, onClick) {
    const button = document.createElement("button");
    button.className = className;
    button.textContent = text;
    button.addEventListener("click", onClick);

    return button;
  }

  function createDiv(className) {
    const div = document.createElement("div");
    div.className = className;

    return div;
  }

  function createInput(id, text, value, type) {
    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.value = value;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = text;

    return {
      input,
      label,
    };
  }

  function createCheckbox(id, text, value) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.checked = value;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = text;

    return {
      checkbox,
      label,
    };
  }
})();
