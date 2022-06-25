const express = require("express");
const cors = require("cors");
const chartData = require('./app')
const fs = require('fs');
const { request } = require("http");
const { response } = require("express");
const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
    res.send('200', {chartData: chartData})
});
app.get("/modules", (req, res) => {
    res.send('200', {modules: chartData.modules})
});
app.get("/moduleGroups", (req, res) => {
    res.send('200', {moduleGroups: chartData.moduleGroups})
});

app.get("/modulegruppe", (req, res) => {
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

