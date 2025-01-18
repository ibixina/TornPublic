// ==UserScript==
// @name         hide-employed
// @namespace    hide-employed.zero.nao
// @version      0.1
// @description  hides anyone in sa job or company in advanced search
// @author       nao [2669774]
// @match        https://www.torn.com/page.php?sid=UserList*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/ibixina/TornPublic/main/hide-in-ajob.user.js
// @downloadURL  https://raw.githubusercontent.com/ibixina/TornPublic/main/hide-in-ajob.user.js

// ==/UserScript==

const filterIcons = [
  "icon21",
  "icon22",
  "icon23",
  "icon24",
  "icon25",
  "icon26",
  "icon73",
  "icon27",
  "icon83",
];
function hide() {
  $(".user-info-list-wrap > li:not([processed])").each(function () {
    const icons = $("#iconTray > li", this);

    $(this).attr("processed", true);
    for (const iconN in icons) {
      const icon = icons[iconN];
      const iconId = icon.id;
      if (!iconId) continue;
      const iconNumber = iconId.slice(0, 6);
      console.log(iconNumber);
      if (filterIcons.includes(iconNumber)) {
        $(this).remove();
        return;
      }
    }
  });
}

setInterval(hide, 1000);
