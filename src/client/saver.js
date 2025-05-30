(function (){

    let isTM = typeof(GM_xmlhttpRequest) !== "undefined" ? true : false;
    let $ = isTM ? unsafeWindow : window;

    // basic XHR
    let getXHR = async url => new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            // 0 - 代表未初始化。 还没有调用 open 方法
            // 1 - 代表正在加载。 open 方法已被调用，但 send 方法还没有被调用
            // 2 - 代表已加载完毕。send 已被调用。请求已经开始
            // 3 - 代表正在与服务器交互中。服务器正在解析响应内容
            // 4 - 代表完成。响应发送完毕
            if (xhr.readyState == 4 && xhr.status === 200) {
                let res = JSON.parse(this.responseText)
                resolve(res);
            }
        }
        xhr.timeout = 2000;
        xhr.ontimeout = e => { reject(`[wgs] Time out for ${url}`); }
        xhr.onerror = e => { reject(`[wgs] Error for ${url}`); }
        xhr.open('GET', url);
        xhr.send();
    });

    let postXHR = async (url, data) => new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let res = JSON.parse(this.responseText)
                resolve(res);
            }
        }
        xhr.timeout = 2000;
        xhr.ontimeout = e => { reject(`[wgs] Time out for ${url}`); }
        xhr.onerror = e => { reject(`[wgs] Error for ${url}`); }
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    });

    // Tampermonkey XHR
    let getTM = async url => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: url,
            method: 'get',
            timeout: 2000,
            onload: function (resp) {
                let res = JSON.parse(resp.responseText)
                resolve(res);
            },
            ontimeout:  _ => { reject(`Time out for ${url}`); },
            onerror: _ => { reject(`Error out for ${url}`); }
        })
    });

    let postTM = async (url, data) => new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            url: url,
            method: 'post',
            timeout: 2000,
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify(data),
            onload: resp => {
                let res = JSON.parse(resp.responseText)
                resolve(res);
            },
            ontimeout:  _ => { reject(`Time out for ${url}`); },
            onerror: _ => { reject(`Error out for ${url}`); }
        })
    });


    let get = isTM ? getTM : getXHR;
    let post = isTM ? postTM : postXHR;
    
    let configed = false;

    // main class
    function SSGameSaver() {
        this.apiHost = ""
        this.game = ''; 
        this.onload = _ => {}
        this.getData = () => { return null };
    }

    SSGameSaver.prototype.config = function (cfg) {
        this.apiHost = cfg.apiHost || this.apiHost;
        this.game = cfg.game || this.game;
        this.onload = cfg.onload || this.onload;
        this.getData = cfg.getData || this.getData;
        configed = true;
    }

    SSGameSaver.prototype.configUserId = async function (name, pass) { return await post(`${this.apiHost}/config`, {name: name, password: pass}); }

    SSGameSaver.prototype.list = async function (userId) { return await get(`${this.apiHost}/${this.game}/${userId}/list`); }

    SSGameSaver.prototype.load = async function (userId, position) { return await get(`${this.apiHost}/${this.game}/${userId}/load/${position}`); }

    SSGameSaver.prototype.save = async function (userId, position, savedData) { return await post(`${this.apiHost}/${this.game}/${userId}/save/${position}`, savedData); }

    SSGameSaver.prototype.listAutoSave = async function (userId) { return await get(`${this.apiHost}/${this.game}/${userId}/auto-save/list`); }

    SSGameSaver.prototype.loadAutoSave = async function (userId, machine) { return await get(`${this.apiHost}/${this.game}/${userId}/auto-save/load/${machine}`); }

    SSGameSaver.prototype.saveAutoSave = async function (userId, machine, savedData) { return await post(`${this.apiHost}/${this.game}/${userId}/auto-save/save/${machine}`, savedData); }

    // page
    $.addEventListener('load', () => {
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(`
.ss-game-saver-bg {position:absolute; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:99999;}
.ss-game-saver-box * {border:0; padding:0; margin:0; text-decoration:none; list-style:none; border-color:rgb(106, 99, 87); color:rgb(232, 230, 227); }
.ss-game-saver-box {position: absolute; left: calc(50% - 100px); top:calc(50% - 208px); width:200px; height:456px; border:1px solid #666; border-radius:5px 5px; background-color:rgb(24, 26, 27); border-color:rgb(106, 99, 87); z-index:999999;}
.ss-game-saver-box .title {margin:0 auto; width:184px; height: 40px; line-height:40px; font-size:18px; font-weight:bold; text-align:center; border-bottom: solid #777 2px; }
.ss-game-saver-box .content {width:200px; height:416px; }
.ss-game-saver-box .content::-webkit-scrollbar {width:6px; height:6px;}
.ss-game-saver-box .content::-webkit-scrollbar-track {box-shadow:inset 0 0 0px rgba(180, 180, 180, .5); border-radius:10px 10px; background-color:rgb(44,44,44);}
.ss-game-saver-box .content::-webkit-scrollbar-thumb {width:6px; height:6px; border-radius:10px 10px; box-shadow:inset 0 0 0px rgba(180, 180, 180, .5); background-color:rgb(209,209,209)}
.ss-game-saver-box .content::-webkit-scrollbar-thumb:hover {background-color:rgb(222,222,222);}
.ss-game-saver-box ul {margin:0;padding:0px 8px;}
.ss-game-saver-box ul li {cursor:pointer; margin:8px 0; border:1px solid #666; border-radius:3px 3px; width:100%; line-height:25px; padding:8px 0; text-align:center;}
.ss-game-saver-box ul li.active:hover {background:rgb(29,127,83);}
        `));
        document.body.appendChild(style);

        var bg = document.createElement('div');
        bg.className="ss-game-saver-bg";
        bg.onclick = () => toggleBoardVisible(false);
        bg.style.display = "none";
        document.body.appendChild(bg);

        var box = document.createElement('div');
        box.className="ss-game-saver-box";
        box.style.display = "none";
        var titleBox = document.createElement('div');
        titleBox.className="title";
        titleBox.innerHTML=""
        box.appendChild(titleBox);
        var contentBox = document.createElement('div');
        contentBox.className="content";
        var ul = document.createElement('ul');
        contentBox.appendChild(ul);
        box.appendChild(contentBox);
        document.body.appendChild(box);
    });

    async function getUserId(saver) {
        var halt = false;
        var userId = $.localStorage.getItem('ss-web-saver-user-id');
        if (!userId) {
            do {
                var configSuccess = false;
                do {
                    // var tmp = prompt('请输入账号密码，格式为："用户名:密码@机器名"。特殊字符需urlencode。机器名部分可选，若不填将禁用自动保存。自动保存按机器名覆盖')
                    var tmp = prompt('Enter login info. Format: "{userName}:{password}[@{machine}]". \r\nUrlencode is needed。Machine is optional, it will disable auto-saving if machine is missing.')

                    if (tmp === null) {halt = true; break;}
                    var outerArr = tmp.split('@')
                    if (outerArr.length > 2) {
                        // alert('格式不正确')
                        alert('Invalid format')
                    }
                    var arr = outerArr[0].split(':')
                    if (arr.length!=2) {
                        // alert('格式不正确')
                        alert('Invalid format')
                    }
                    else {
                        var res = await saver.configUserId(decodeURIComponent(arr[0]), decodeURIComponent(arr[1]))
                        if (res.success) {
                            userId = res.userId;
                            $.localStorage.setItem('ss-web-saver-user-id', userId)
                            if (outerArr.length==2){
                                $.localStorage.setItem('ss-web-saver-machine', decodeURIComponent(outerArr[1]))
                            }
                            configSuccess = true
                        }
                        else{
                            alert(res.userId)
                        }
                        break;
                    }
                } while(true);
            } while(!configSuccess && !halt)
        }
        if (halt) throw new Error('Login canceled');
        return userId;
    }

    function toggleBoardVisible(display, scroll, title) {
        //scroll bar
        if(display && scroll){
            document.getElementsByClassName('ss-game-saver-box')[0].getElementsByClassName('content')[0].style.overflowY="scroll";
        }
        else{
            document.getElementsByClassName('ss-game-saver-box')[0].getElementsByClassName('content')[0].style.overflowY="hidden";
        }
        document.getElementsByClassName('ss-game-saver-box')[0].getElementsByClassName('title')[0].innerHTML = title;
        document.getElementsByClassName('ss-game-saver-box')[0].style.display=display?"block":"none";
        document.getElementsByClassName('ss-game-saver-bg')[0].style.display=display?"block":"none";
    }

    async function mapLoadingBoard(saver) {
        var userId;
        var list;

        try {
            userId = await getUserId(saver);
            list = await saver.list(userId);
        }
        catch (e) {
            console.log(e)
            return;
        }
        
        document.getElementsByClassName('ss-game-saver-box')[0].getElementsByTagName('ul')[0].innerHTML='';
        var i = 0;
        list.forEach(element => {
            i++;
            var li = document.createElement('li');
            if (element) {
                let date = new Date(element)
                li.innerHTML=date.toLocaleString();
            }
            else {
                li.innerHTML='&nbsp;'
            }
            if(element) {
                li.className = 'active';
                ((el, x) => { 
                    el.onclick = async () => {
                        saver.onload(await saver.load(userId, x));
                        toggleBoardVisible(false)
                    }
                })(li, i); 
            }
            document.getElementsByClassName('ss-game-saver-box')[0].getElementsByTagName('ul')[0].appendChild(li);
        });
        toggleBoardVisible(true, false, "Loading")
    }

    async function mapSavingBoard(saver) {
        var userId = await getUserId(saver);
        var list = await saver.list(userId);
        document.getElementsByClassName('ss-game-saver-box')[0].getElementsByTagName('ul')[0].innerHTML='';
        var i = 0;
        list.forEach(element => {
            i++;
            var li = document.createElement('li');
            if(element) {
                let date = new Date(element)
                li.innerHTML=date.toLocaleString();
            }
            else {
                li.innerHTML='&nbsp;'
            }
            li.className = 'active';
            ((el, x) => {
                el.onclick = async () => {
                    await saver.save(userId, x, saver.getData());
                    await mapSavingBoard(saver);
                    // toggleBoardVisible(false)
                }
            })(li, i);
            document.getElementsByClassName('ss-game-saver-box')[0].getElementsByTagName('ul')[0].appendChild(li);
        });
        toggleBoardVisible(true, false, "Saving")
    }

    async function mapLoadingAutoSaveBoard(saver) {
        var userId = await getUserId(saver);
        var machine = $.localStorage.getItem('ss-web-saver-machine');
        // if(!machine) alert('未设置机器名，当前不会进行自动存档！建议设置机器名以启用本机自动存档。\r\n\r\n方法：在localstorage中添加ss-web-saver-machine字段，在值中给本台机器命名');
        if(!machine) alert('Machine name is not set. No auto-saving will process. It is recommended to set machine name to enable auto saving.\r\n\r\nHow to: In localstorage, add `ss-web-saver-machine` filed, values your machine name.');

        var list = await saver.listAutoSave(userId);
        document.getElementsByClassName('ss-game-saver-box')[0].getElementsByTagName('ul')[0].innerHTML='';
        list.forEach(element => {
            var li = document.createElement('li');
            let machine = element.machine;
            let date = new Date(element.time)
            li.innerHTML= '【' + element.machine + '】<br/>' + date.toLocaleString();
            li.className = 'active';
            ((el, m) => {
                el.onclick = async () => {
                    saver.onload(await saver.loadAutoSave(userId, m));
                    toggleBoardVisible(false)
                }
            })(li, machine);
            document.getElementsByClassName('ss-game-saver-box')[0].getElementsByTagName('ul')[0].appendChild(li);
        });
        toggleBoardVisible(true, true, "Load Auto-Save")
    }

    SSGameSaver.prototype.clear = function () {
        $.localStorage.removeItem('ss-web-saver-machine')
        $.localStorage.removeItem('ss-web-saver-user-id')
    }

    SSGameSaver.prototype.showLoadingBoard = async function showLoadingBoard() {
        if (!configed) { console.log("Game saver not configured!"); return; }
        try {
            await mapLoadingBoard(this);
        } catch (e) {
            console.error(e)
        }
    }

    SSGameSaver.prototype.showSavingBoard = async function showSavingBoard() {
        if (!configed) { console.log("Game saver not configured!"); return; }
        try {
            await mapSavingBoard(this);
        } catch (e) {
            console.error(e)
        }
    }

    SSGameSaver.prototype.showLoadingAutoSaveBoard = async function showLoadingAutoSaveBoard() {
        if (!configed) { console.log("Game saver not configured!"); return; }
        try {
            await mapLoadingAutoSaveBoard(this);
        } catch (e) {
            console.error(e)
        }
    }

    // listening key events
    $.addEventListener('load', () => {
        document.addEventListener('keydown', e => {
            // console.log(e.key)
            var key = e.key;
            var shiftKey = e.shiftKey;
            var altKey = e.altKey;
            if(shiftKey && altKey && (key.toLowerCase() === "s" || key.toLowerCase() === "í" ) && !e.repeat) {
                $.ssGameSaver.showSavingBoard();
            }
            else if(shiftKey && altKey && (key.toLowerCase() === "l" || key.toLowerCase() === "ò" ) && !e.repeat) {
                $.ssGameSaver.showLoadingBoard();
            }
            else if(shiftKey && altKey && (key.toLowerCase() === "a" || key.toLowerCase() === "å" ) && !e.repeat) {
                $.ssGameSaver.showLoadingAutoSaveBoard();
            }
            else if(key == "Escape") {
                toggleBoardVisible(false);
            }
        })
    });

    // auto saving
    async function autoSave(saver) {
        if (!configed) { return; }
        var userId = $.localStorage.getItem('ss-web-saver-user-id');
        var machine = $.localStorage.getItem('ss-web-saver-machine');
        if (!userId || !machine) return; //未登录时不开启
        await saver.saveAutoSave(userId, machine, saver.getData());
        console.log(`Saved to remote host automatically.  ${(new Date()).toTimeString()}`);
    }

    $.addEventListener('load', () => {
        setInterval(async function () {
            await autoSave($.ssGameSaver);
        }, 60000)
    });

    // inject
    $.ssGameSaver = new SSGameSaver();

    // inject to window
    window.ssGameSaverWindow = $;
})();