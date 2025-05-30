//@game-name       Evolve
//@playing-url     https://pmotschmann.github.io/Evolve/
//@project-url     https://github.com/pmotschmann/Evolve
function configSaver_Evolve(apiHost) {
    let $ = window.ssGameSaverWindow; //Getting window instance, always do this, and use $ instead of window in codes below.
    let cfg = {
        apiHost: apiHost, //Host url for server
        game: 'evolve', //Game ID, should be unique
        onload: data => $.importGame(data), //How to import saving data to the game
        getData: () => $.exportGame() //How to get the saving data from the game
    }
    $.ssGameSaver.config(cfg) //Always call this at last in every config-function
}
