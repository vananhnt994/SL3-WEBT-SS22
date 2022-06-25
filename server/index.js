const express = require("express");
const cors = require("cors");
const fs = require('fs');
const { request } = require("http");
const { response } = require("express");
const app = express();
const port = 3000;


const path = './server/data.json'

fs.readFile('./server/data.json', (err, data) => {
    if (err) throw err;
    console.log(JSON.parse(data));
});

app.use(cors());


app.get("/module", (req, res) => {
    let test 

    fs.readFile('./server/data.json', (err, data) => {
        if (err) throw err;
        test = JSON.parse(data);
    });
    
    res.json({test})
});

app.get("/modulegruppe", (req, res) => {
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
