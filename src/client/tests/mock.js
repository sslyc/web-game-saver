// nodejs
const port = 3000;

const express = require('express');
const app = express();

app.use('*', function(_, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', '*');
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Content-Type", "application/json");
    next();
});


app.get(/.*\/auto-save\/list$/, (_, res) => {
    res.send([
        {
            "time": "2024-12-04T17:58:21.8525269",
            "machine": "office-pc"
        },
        {
            "time": "2024-10-28T21:29:01.7047584",
            "machine": "home-pc"
        },
        {
            "time": "2024-08-30T15:59:10.7858187",
            "machine": "mobile-android"
        },
        {
            "time": "2024-06-10T13:27:08.3829458",
            "machine": "mobile-iOS"
        },
        {
            "time": "2024-08-30T15:59:10.7858187",
            "machine": "scroll-test1"
        },
        {
            "time": "2024-06-10T13:27:08.3829458",
            "machine": "scroll-test2"
        },
        {
            "time": "2024-06-10T13:27:08.3829458",
            "machine": "scroll-test3"
        },
        {
            "time": "2024-06-10T13:27:08.3829458",
            "machine": "scroll-test4"
        }
    ]);
})

app.get(/.*list$/, (_, res) => {
    res.send([
        "2024-12-03T11:22:41.0822345",
        null,
        null,
        null,
        "2024-11-01T10:42:18.5849951",
        null,
        null,
        "2024-11-29T16:04:36.4357569"
    ]);
})


app.post(/.*config$/, (_, res) => {
    res.send(JSON.stringify({
        success: true,
        userId: 'FD1286353570C5703799BA76999323B7C7447B06'
    }));
});

app.post(/.*save.*/, (_, res) => {
    res.send(JSON.stringify(true));
});

app.get(/.*load.*/, (_, res) => {
    res.send(JSON.stringify("yes! u win."));
});
  
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}/`);
});
