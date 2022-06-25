const fs = require('fs')
const express = require("express");

let rawData = fs.readFileSync('server/data.json');
let chartData = JSON.parse(rawData)

module.exports = chartData


