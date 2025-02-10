// ==UserScript==
// @name         rearrage-sidebar
// @namespace    rearrage-sidebar.zero.nao
// @version      0.1
// @description  rearraange sidebars
// @author       nao [2669774]
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/ibixina/TornPublic/main/rearrange-sidebar.user.js
// @downloadURL  https://raw.githubusercontent.com/ibixina/TornPublic/main/rearrange-sidebar.user.js

// ==/UserScript==

GM_addStyle(`
 #sidebar{
	display: grid;
        grid-template-columns: 100% 100%;
	transform: translateX(-100%);
	gap: 10px;
}

div.sidebar-block___Ef1l1:nth-child(1) {
	grid-column: 1;
	grid-row: span 2;
}
`);
