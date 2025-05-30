# Web Game Saver

Switch to [English Document](./README.md)

## 目的

该项目用于一类Web挂机游戏，通常都是开源项目。该类游戏通常使用纯前端技术编写，无需后端API支撑。在页面加载完后几乎可以完全脱机运行。游戏存档通常存储在的浏览器的Local Storage中。这类游戏的代表例如：[Evolve](https://github.com/pmotschmann/Evolve)、[A Dark Room](https://github.com/doublespeakgames/adarkroom?tab=readme-ov-file) 等。

该项目的目的在于：针对这类游戏，提供远程存档支持。使得玩家可以将存档应用于多个设备上，实现更换电脑时可以继续游玩自己的进度，避免手动导入导出进度导致的麻烦和混乱。

## 介绍

项目包含Server端和Client端代码。

- Server端采用C#编写，目标平台为.Net8。使用Sqlite作为数据库。推荐使用docker运行。

- Clinet端采用原生Javascript编写，不采用额外框架。支持嵌入到游戏网页中或通过油猴启用两种模式。

    1. 嵌入到游戏网页中

        你需要拿到游戏的源码或编译后的文件，修改游戏入口文件（通常为index.html），将本项目的js引入进该页面，并添加配置代码。然后使用HTTP服务器部署该游戏。

        用该方式部署的好处是：对任何访问该游戏服务器的电脑，无需做做任何设置便可使用。

        局限是：你必须能够修改游戏的部署代码。

    2. 使用油猴脚本

        你需要在浏览器（Chome、Edge等）上安装油猴插件。新建脚本，将本项目的js粘贴进去并添加配置代码。你需要在每台需要进行游戏的机器的浏览器上重复该操作。

        用该方式部署的好处是：你无需拿到游戏修改和部署权限，可以对任何游戏服务器（例如官方服务器）生效。

        缺点是：任何用于游戏的电脑都必须进行了配置，否则该电脑无法使用远程存档功能。

## 安装

下载[发布版](./release)。

### Server

在作为远程存档服务器的机器（可以是本机）上执行:

```shell
sudo docker load -i wgs-1.0.tar
sudo mkdir /wsg-db
sudo docker run -d -p 80:80 -v /wsg-db:/data -e TZ=Asia/Shanghai --name=wgs --restart=always wgs
```

目录、时区、端口等可以根据需要进行修改。

之后打开浏览器，访问http://{服务器ip或者域名}:{端口}/install，以创建数据库结构。该步骤仅需执行一次。

### Client

- 方法1：嵌入到游戏代码中

    以evolve游戏举例：

    在游戏代码目录下新建wgs目录。将主文件`saver.js`和游戏配置文件`evolve.js`拷贝进该目录下。

    在游戏代码的index.html文件中，body体的尾部，添加引入代码：

    ```html
    <script src='wgs/saver.js'></script>
    <script src='wgs/evolve.js'></script>
    <script>
        configSaver_Evolve('http://[你的Server服务器]:[端口]')
    </script>
    ```

    具体样例请参考 [inject.index.html](./samples/client/inject.index.html)

- 方法2：使用油猴

    以evolve游戏举例：

    1. 在浏览器插件油猴中，新建脚本，生成默认脚本格式。

    2. 插件头部描述修改如下：

        ```js
        // ==UserScript==
        // @name         Web Game Saver
        // @name:zh-CN   游戏进度远程保存
        // @namespace    https://github.com/sslyc
        // @version      2024-12-13
        // @description  Saving & loading game profile to/from remote server.
        // @author       sslyc
        // @match        *://pmotschmann.github.io/Evolve*
        // @exclude      *://pmotschmann.github.io/Evolve/wiki.html*
        // @icon         https://pmotschmann.github.io/Evolve/evolved-light.ico
        // @grant        GM_xmlhttpRequest
        // @grant        unsafeWindow
        // @connect      *
        // @run-at       document-end
        // @sandbox      none
        // ==/UserScript==
        ```

        请根据实际情况修改上述内容。其中`@match`为启用该脚本的Url，`@exclude`则是应该排除的Url。两者均可以提供多个。

    3. 代码部分修改如下：

        ```js

        {粘贴 saver.js 内容到这里}

        {粘贴 evolve.js 内容到这里}

        (function() {
            'use strict';

            configSaver_Evolve('http://[你的Server服务器]:[端口]', true)
        })();
        ```

    具体样例请参考 [tampermonkey.script.js](./samples/client/tampermonkey.script.js)

## 用法

- 按下 `ctrl + alt + s`键呼出手动存档界面。
- 按下 `ctrl + alt + l`键呼出手动读档界面。
- 按下 `ctrl + alt + a`键呼出读取自动存档界面。

> 如果使用油猴，在首次使用时，可能会弹出油猴的权限提示，请选择始终允许。

首次呼出，需要填写登录信息，格式为：

`user:password[@{machine}]`

- user或password如包含特殊字符（如@/:等），需要做UrlEncode
- @{machine}是可选的，如果填写则会启用自动存档。自动存档机制为：每指定一个新的machine，都会生成一个新的自动存档位，**每隔一分钟会自动保存，并覆盖该machine名称的存档位**。若不填写将禁用自动保存功能，不影响手动s/l，也不影响从自动存档中读取。

登录信息举例：

- `doggy:123456`
- `tom:654321@home-pc`
- `jerry:123%40456@office-pc`

注意：本项目采用较为简单的密码策略：通过用户名和密码计算哈希值作为你的用户ID，并在后续数据传输中仅仅提供用户ID来对不同用户作为区分。因此，首次登录时密码可以随意指定，但指定后不再支持修改密码！第二次登录开始（比如登录新设备），如果密码与用户名不符，将登录失败！**没有任何办法帮你找回密码**，请牢记账号和密码！

如果真的忘记了密码，你需要找到sqlite数据库文件，通过直接修改数据库来重置密码。方法为：

1. 使用新的账户名+密码，计算`md5('{password}7j7gp1ECga2cX6npj2n3VVm25rwwp89j{name}')`，得到大写哈希值作为用户ID。
2. 将Users表中，找到属于你的账号，并记录表中的UserId值。将UserId值改为上述md5值，Name值改为上述账户名
3. 将Profiles表中，所有UserId值为之前Users表中UserId值的记录的UserId字段全部修改为上述md5值。
4. 使用你的新账户名+密码再每个游戏的机器上重新登录。如果有的机器已经登录了，可以参考下面的`高级操作`进行清空。

## 高级操作

- 【清理账户信息】：

    - 通过控制台

        按F12打开浏览器开发者功能，切换到控制台。在控制台输入命令`ssGameSaver.clear()`并按回车。

    - 通过Local Storage

        按F12打开浏览器开发者功能，在local storage中删除ss-web-saver-user-id字段和ss-web-saver-machine字段。

    > 注意：删除账户信息后，按下快捷键重新呼出面板，将进行重新登录

- 【切换账户】：按F12打开浏览器开发者功能，在local storage中删除ss-web-saver-user-id字段和ss-web-saver-machine字段，再次用快捷键呼出该模块，重新输入用户名密码和机器名。

- 【启用自动保存功能】：按F12打开浏览器开发者功能，在local storage中设置ss-web-saver-machine字段，该字段就是登陆时设置的机器名。

- 【禁用自动保存功能】：按F12打开浏览器开发者功能，在local storage中删除ss-web-saver-machine字段。

## 贡献

欢迎为该项目做贡献，以支持更多的web游戏存档。

你只需要：

1. 分析你喜爱的游戏源码，找到导入和导出文档的方法。在游戏的浏览器窗口调试方法，确保你找到的方法能够正常保存和读取游戏存档。

2. Fork本仓库

3. 在src/client/games目录下，为你编写的游戏新建配置文件、测试文件。参考已有游戏配置文件，填写游戏名、如何获取该游戏的存档以便用于保存至服务器、如何将从服务器读取的存档导入游戏中等内容。

    如果你发现原游戏的导入导出存档功能使用的是二进制数据，请在将本地存档提交给服务器前做base64编码，并在从服务器取出读档数据后进行base64解码后再导入。

4. 提交Pull Request。
