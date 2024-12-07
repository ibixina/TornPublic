// ==UserScript==
// @name         faction-logs
// @namespace    faction-logs.zero.nao
// @version      0.1
// @description   Arranges the faction logs in a more organized way
// @author       nao [2669774]
// @match        https://www.torn.com/factions.php?step=your*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    <UPDATE_URL>
// @downloadURL  <DOWNLOAD_URL>

// ==/UserScript==

let api = "";
let url = window.location.href;
let rfc = getRFC();
let factionMembers = [];

async function main() {
  console.log("faction");
  await getFactionMembers();
  console.log(factionMembers);
  insert();
  console.log("arrange");
  arrange();
  setInterval(arrange, 5000);
}
async function getFactionMembers() {
  const response = await $.getJSON(
    `https://api.torn.com/faction/?selections=&key=${api}`,
  );
  factionMembers = Object.keys(response.members);
}

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
  if ($("ul[class^='listWrapper_'] > li").length == 0) {
    setTimeout(insert, 1000);
    return;
  }

  let container = document.createElement("div");
  container.id = "attacking-container";

  const ul = document.querySelector("ul[class^='listWrapper_']");
  ul.insertBefore(container, ul.firstChild);
}

function arrange() {
  $("ul[class^='listWrapper_'] > li:not('processed')").each(function (e) {
    const currentEl = $(this);
    $("a[href^='profiles.php']", $(this)).each(function () {
      const userId = $(this).attr("href").split("XID=")[1];
      if (factionMembers.includes(userId)) {
        addEl(currentEl.get(0), userId);
      }
      $(this).attr("processed", "true");
    });
  });
}

function addEl(el, id) {
  const container = document.getElementById("attacking-container");
  let childEl = container.querySelector(`#user-${id}`);
  if (childEl) {
    const childContainer = childEl.querySelector(".logs");
    console.log(el);
    childContainer.appendChild(el);
  } else {
    // Create the container div
    childEl = document.createElement("li");
    childEl.id = `user-${id}`;
    childEl.style.textDecoration = "none";

    // Create a wrapper div for link and button
    const topDiv = document.createElement("div");
    topDiv.style.display = "flex";
    topDiv.style.alignItems = "center";
    topDiv.style.marginBottom = "10px";

    // Create the link
    const link = document.createElement("a");
    link.href = `https://www.torn.com/profiles.php?XID=${id}`;
    link.style.flex = "1";
    const img = document.createElement("img");
    img.src = `https://www.torn.com/sigs/19_${id}.png`;
    img.style.width = "50%";
    link.appendChild(img);

    // Create the button
    const button = document.createElement("button");
    button.textContent = "Expand";
    button.style.float = "right";
    button.style.color = `var(--default-blue-color)`;

    // Add link and button to top div
    topDiv.appendChild(link);
    topDiv.appendChild(button);

    // Create the child div
    const childDiv = document.createElement("div");
    childDiv.className = "logs";
    childDiv.style.display = "none"; // Initially hidden
    childDiv.style.marginTop = "10px";

    // Append top div and child div to the list item
    childEl.appendChild(topDiv);
    childEl.appendChild(childDiv);
    container.appendChild(childEl);

    // Add event listener to the button
    button.addEventListener("click", () => {
      childDiv.style.display =
        childDiv.style.display === "none" ? "block" : "none";
    });

    addEl(el, id);
  }
}

if (
  window.location.href.includes("type=2") ||
  window.location.href.includes("type=3")
) {
  main();
}

$(document).on("hashchange", function () {
  if (
    window.location.href.includes("type=2") ||
    window.location.href.includes("type=3")
  ) {
    main();
  }
});
