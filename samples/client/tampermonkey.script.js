// ==UserScript==
// @name         Web Game Remote Saver for [game-name]
// @name:zh-CN   游戏进度远程保存 - [游戏名称]
// @namespace    https://github.com/sslyc
// @version      2024-12-13
// @description  Saving & loading game profile to/from remote server.
// @author       sslyc
// @match        *://[game-url]*
// @exclude      *://[game-exclude-url-if-in-need]*
// @icon         [game-logo-url]
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      *
// @run-at       document-end
// @sandbox      none
// ==/UserScript==

/* 
  [paste content in saver.js here]
*/

/* 
  [paste content in [game-name].js here]
*/

(function() {
    'use strict';

    configSaver_[Game-Name]('[game-url]');
})();


// [TODO] Notice that, @match and @exclude in header should be changed to your own game host, and more @match and @exlude lines are allowed. 