# Web Game Saver

切换到 [中文文档](./README_zh_CN.md)

## Purpose

This project is designed for a category of web-based idle games, typically open-source projects. These games are usually written using pure frontend technologies and require no backend API support. They can run almost completely offline after the page loads. Game saves are typically stored in the browser's Local Storage. Representative examples of such games include: [Evolve](https://github.com/pmotschmann/Evolve), [A Dark Room](https://github.com/doublespeakgames/adarkroom?tab=readme-ov-file), etc.

The purpose of this project is to provide remote save support for such games. It allows players to use their saves across multiple devices, enabling them to continue their progress when switching computers, and avoiding the hassle and confusion of manual save import/export.

## Introduction

The project consists of Server-side and Client-side code.

- **Server-side**: Written in C#, targeting .NET 8 platform. Uses SQLite as the database. Recommended to run via Docker.

- **Client-side**: Written in native JavaScript without additional frameworks. Supports two modes: embedding into game webpages or enabling via Tampermonkey.

    1. **Embedding into game webpage**  
        You need access to the game's source code or compiled files. Modify the game's entry file (usually index.html) to include this project's JS file and add configuration code. Then deploy the game using an HTTP server.  
        **Advantage**: Any computer accessing the game server can use it without additional setup.  
        **Limitation**: You must be able to modify the game's deployment code.

    2. **Using Tampermonkey script**  
        Install the Tampermonkey extension in your browser (Chrome, Edge, etc.). Create a new script, paste this project's JS code, and add configuration code. Repeat this setup on every machine used for gaming.  
        **Advantage**: No need for game modification/deployment permissions; works with any game server (e.g., official servers).  
        **Disadvantage**: Every gaming computer must be configured individually.

## Installation

Download the [release version](./release).

### Server

On the machine serving as the remote save server (could be your local machine):

```shell
sudo docker load -i wgs-1.0.tar
sudo mkdir /wsg-db
sudo docker run -d -p 80:80 -v /wsg-db:/data -e TZ=Asia/Shanghai --name=wgs --restart=always wgs
```

Modify directories, timezone, ports, etc., as needed.

Then open a browser and visit `http://{server_ip_or_domain}:{port}/install` to create the database structure. This step only needs to be performed once.

### Client

- **Method 1: Embed into game code**  
    Taking Evolve as an example:  
    1. Create a `wgs` directory in the game code directory.  
    2. Copy `saver.js` and the game config file `evolve.js` into this directory.  
    3. Add the following code before the closing `</body>` tag in the game's index.html:  
    ```html
    <script src='wgs/saver.js'></script>
    <script src='wgs/evolve.js'></script>
    <script>
        configSaver_Evolve('http://[your_Server]:[port]')
    </script>
    ```
    Sample reference: [inject.index.html](./samples/client/inject.index.html)

- **Method 2: Use Tampermonkey**  
    Taking Evolve as an example:  
    1. Create a new script in Tampermonkey.  
    2. Modify the header as follows:  
    ```js
    // ==UserScript==
    // @name         Web Game Saver
    // @name:zh-CN   游戏进度远程保存
    // @namespace    https://github.com/sslyc
    // @version      2024-12-13
    // @description  Saving & loading game profile to/from remote server.
    // @author       sslyc
    // @match        *://pmotschmann.github.io/Evolve*
    // @exclude      *://pmotschmann.github.io/Evolve/wiki*
    // @icon         https://pmotschmann.github.io/Evolve/evolved-light.ico
    // @grant        GM_xmlhttpRequest
    // @grant        unsafeWindow
    // @connect      *
    // @run-at       document-end
    // @sandbox      none
    // ==/UserScript==
    ```
    Adjust `@match` and `@exclude` as needed.  
    3. Paste the script content:  
    ```js
    {Paste saver.js content here}
    
    {Paste evolve.js content here}
    
    (function() {
        'use strict';
        configSaver_Evolve('http://[your_Server]:[port]', true)
    })();
    ```
    Sample reference: [tampermonkey.script.js](./samples/client/tampermonkey.script.js)

## Usage

- Press `Ctrl + Alt + S` to open the manual save interface.
- Press `Ctrl + Alt + L` to open the manual load interface.
- Press `Ctrl + Alt + A` to open the auto-save load interface.

> When using Tampermonkey, permission prompts may appear on first use. Select "Always Allow".

**First-time login format**:  
`user:password[@{machine}]`  

- URL-encode special characters in username/password (e.g., `@`, `/`, `:`)
- `@{machine}` is optional. If provided:  
  - Enables auto-save feature  
  - Creates a new auto-save slot for each machine name  
  - **Saves automatically every minute, overwriting the machine-named slot**  

**Examples**:  
- `doggy:123456`  
- `tom:654321@home-pc`  
- `jerry:123%40456@office-pc`  

**Password Policy**:  
- UserID = `MD5('{password}7j7gp1ECga2cX6npj2n3VVm25rwwp89j{name}')` (uppercase)  
- Passwords cannot be modified after initial setup  
- Changing devices requires identical username/password combination  
- **There is NO password recovery mechanism**  

**If password is forgotten**:  
1. Compute new UserID using desired credentials  
2. Manually update SQLite database:  
   - Modify `UserId` in `Users` table  
   - Update all corresponding `UserId` values in `Profiles` table  
3. Re-login on all devices  

## Advanced Operations

- **Clear Account Info**:  
  - Via console: Execute `ssGameSaver.clear()` in browser console  
  - Via Local Storage: Delete `ss-web-saver-user-id` and `ss-web-saver-machine`  

- **Switch Account**:  
  Delete `ss-web-saver-user-id` and `ss-web-saver-machine` in Local Storage, then re-login  

- **Enable Auto-Save**:  
  Set `ss-web-saver-machine` in Local Storage to your machine name  

- **Disable Auto-Save**:  
  Delete `ss-web-saver-machine` from Local Storage  

## Contribution

Contributions to support more web games are welcome!  

How to contribute:  
1. Analyze your favorite game's source code to identify save/load methods  
2. Fork this repository  
3. Create new config/test files under `src/client/games/`  
4. Implement:  
   - Game name identification  
   - Save data extraction for server upload  
   - Save data injection for loading  
   - Base64 encode/decode if game uses binary saves  
5. Submit Pull Request  
