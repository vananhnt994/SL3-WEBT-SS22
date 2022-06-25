modulesUrl = 'http://localhost:3000/modules'
moduleGroups = 'http://localhost:3000/moduleGroups'
const loadDataFromServer =  async () => {
    // Anmerkung: Hier ist fetch(url, {mode: "cors"}) zu nutzen.

    var moduleGroupsJSON =  fetchJSON(moduleGroups)
    var modulesJSON =  fetchJSON(modulesUrl)
    return {'modules':modulesJSON['modules'], 'modulesGroup':moduleGroupsJSON['moduleGroups']}
}
let fetchJSON = async  (url) => {
    const res = await fetch(url, {
        mode: "cors",
        method: "GET",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json'
        },
    })
    return res.json()
}
$(document).ready(() => {
    loadDataFromServer()
})
function loadDataFromFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json")
    rawFile.open('GET',file, true)
    rawFile.onreadystatechange =    () => {
        if(rawFile.readyState === 4 && rawFile.status == "200" ) {
            callback(rawFile.responseText)
        }
    }
    rawFile.send(null)
}


var chartInnerDiv = '<div class="innerCont" style="overflow: auto;top:100px; left: 400px; height:91% ; Width:100% ;position: relative;overflow: hidden;"/>';
const homePage = () => {
    document.getElementById('content').innerHTML = ''
    apiUrl  =   'https://web-t.l0e.de/tl2/news'
    loadDataFromFile(apiUrl, (text) => {
        var data = JSON.parse(text)
        document.getElementById('content').innerHTML += `<h1>Willkommen zum Studiengang Wirtschaftsinformatik</h1></br>
        <h2>PieChart befindet sich durch Navigationsbutton Diagramm</h2></br>
        <h3>Hier sind Daten von letzter Studienleistung</h3></br>${JSON.stringify(data)}`
    })
}
window.addEventListener('load',() => {
    document.getElementById('content').innerHTML = ''
    Plot()
})
function Impressum() {
    document.getElementById('diagramm').classList.remove('here')
    document.getElementById('impressum').classList.add('here')
    document.getElementById('content').innerHTML = ''
    document.getElementById('content').innerHTML += '<h1>Hier ist Impressum</h1>'
}


function Plot() {
    document.getElementById('diagramm').classList.add('here')
    document.getElementById('impressum').classList.remove('here')
    document.getElementById('content').innerHTML = ''
    var datafromServer =  loadDataFromServer().then((text) => {return text})
    console.log(datafromServer)
    if(datafromServer != null) {
        var chartData =  datafromServer['modules']
        var options =  datafromServer['moduleGroups']
        var chartOptions = [
            {
                "captions": options,
                "color": [{ "A1": "#FFA500", "A2": "#0070C0", "A3": "#ff0000","A4":"#AE79D1","A5":"#79C8D1","A6":"#79D194","A7":"#C8D179"  }],
                "xaxis": "moduleGroup",
                "xaxisl1": "moduleName",
                "yaxis": "moduleAcronym"
            }
        ]
        TransformChartData(chartData, chartOptions, 0);
        BuildPie("content", chartData, chartOptions, 0)

    } else {
        loadDataFromFile('../data-backup.json', (text) => {
            var data = JSON.parse(text)
            var chartData = data['modules']
            var options = data['moduleGroups']
            var chartOptions = [
                {
                    "captions": options,
                    "color": [{ "A1": "#FFA500", "A2": "#0070C0", "A3": "#ff0000","A4":"#AE79D1","A5":"#79C8D1","A6":"#79D194","A7":"#C8D179"  }],
                    "xaxis": "moduleGroup",
                    "xaxisl1": "moduleName",
                    "yaxis": "moduleAcronym"
                }
            ]
            TransformChartData(chartData, chartOptions, 0);
            BuildPie("content", chartData, chartOptions, 0)
        })

    }
}


function BuildPie(id, chartData, options, level) {
    var xVarName;
    var divisionRatio = 2.5;
    var legendoffset = (level == 0) ? 0 : -40;

    d3.selectAll("#" + id + " .innerCont").remove();
    $("#" + id).append(chartInnerDiv);

    var yVarName = options[0].yaxis;
    var width = $($("#" + id + " .innerCont")[0]).outerWidth();
    var height = $($("#" + id + " .innerCont")[0]).outerHeight();
    var radius = Math.min(width, height) / divisionRatio;

    if (level == 1) {
        xVarName = options[0].xaxisl1;
    }
    else {
        xVarName = options[0].xaxis;
    }
    var rcolor = d3.scaleOrdinal().range(runningColors);

    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(radius - 290);

    var arcOver = d3.arc().outerRadius(radius + 20).innerRadius(radius - 250);

    var chart = d3.select("#" + id + " .innerCont")
        .append("svg")  //append svg element inside #chart
        .attr("width", width)    //set width
        .attr("height", height)  //set height
        .append("g")
        .attr("transform", "translate(" + (width / divisionRatio) + "," + ((height / divisionRatio) + 30) + ")");

    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.total;
        })(runningData);

    var g = chart.selectAll(".arc")
        .data(pie)
        .enter().append("g")
        .attr("class", "arc");

    var count = 0;

    var path = g.append("path")
        .attr("d", arc)
        .attr('class','path')
        .attr("id", function () { return "arc-" + (count++); })
        .style("opacity", function (d) {
            return d.data["op"];
        })
        .attr("title", function (d) {return `${d.data[xVarName]}  ${d.data["title"]}`});
    var div = g
        .append('text')
        .attr("id", "tooltip-donut")
        .style("opacity", 0)


    path.on("mouseover", function (e,d) {
        d3.select(this)
            .attr("stroke", "white")
            .transition()
            .duration(200)
            .attr("d", arcOver)
            .attr("stroke-width", 1);
    })
        .on("mouseleave", function (d) {
            d3.select(this).transition()
                .duration(200)
                .attr("d", arc)
                .attr("stroke", "none");
            div.transition()
                .duration('50')
                .style("opacity", 0);
        })



    path.append("svg:title")
            .text(function (d) {
                return `${d.data[xVarName]}  ${d.data["title"]}`;
            });

    path.style("fill", function (d) {
        return rcolor(d.data[xVarName]);
    }).transition().duration(1000).attrTween("d", tweenIn)


    g.append("text")
        .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", .35)
        .style("text-anchor", "middle")
        .style("opacity", 1)
        .text(function (d) {
            return d.data[xVarName];
        });

    count = 0;
    var legend = chart.selectAll(".legend")
        .data(runningData).enter()
        .append("g").attr("class", "legend")
        .attr("legend-id", function (d) {
            return count++;
        })
        .attr("transform", function (d, i) {
            return "translate(15," + (parseInt("-" + (runningData.length * 10)) + i * 28 + legendoffset) + ")";
        })
        .style("cursor", "pointer")


    var leg = legend.append("rect");

    leg.attr("x", width / 2)
        .attr("width", 18).attr("height", 18)
        .style("fill", function (d) {
            return rcolor(d[yVarName]);
        })
        .style("opacity", function (d) {
            return d["op"];
        });
    legend.append("text").attr("x", (width / 2) - 5)
        .attr("y", 9).attr("dy", .35)
        .style("text-anchor", "end").text(function (d) {
        return d.title;
    });

    leg.append("svg:title")
        .text(function (d) {
            return d["title"] + " (" + d[yVarName] + ")";
        });

    function tweenOut(data) {
        data.startAngle = data.endAngle = (2 * Math.PI);
        var interpolation = d3.interpolate(this._current, data);
        this._current = interpolation(0);
        return function (t) {
            return arc(interpolation(t));
        };
    }

    function tweenIn(data) {
        var interpolation = d3.interpolate({ startAngle: 0, endAngle: 0 }, data);
        this._current = interpolation(0);
        return function (t) {
            return arc(interpolation(t));
        };
    }

}

async function TransformChartData(chartData, opts, level, filter) {
    var result = [];
    var resultColors = [];
    var counter = 0;
    var hasMatch;
    var xVarName;
    var yVarName = opts[0].yaxis;

    if (level == 1) {
        xVarName = opts[0].xaxisl1;
        for (var i in chartData) {
            hasMatch = false;
            for (var index = 0; index < result.length; ++index) {
                var data = result[index];

                if ((data[xVarName] == chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) == filter) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                }

            }
            if ((hasMatch == false) && ((chartData[i][opts[0].xaxis]) == filter)) {
                if (result.length < 9) {
                    let ditem = {}
                    ditem[xVarName] = chartData[i][xVarName];
                    ditem[yVarName] = chartData[i][yVarName];
                    console.log(chartData[i][xVarName])
                    ditem["title"] = chartData[i][xVarName];
                    ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                    result.push(ditem);

                    resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];

                    counter += 1;
                }
            }
        }
    }
    else {
        xVarName = opts[0].xaxis;
        for (var i in chartData) {
            hasMatch = false;
            for (var index = 0; index < result.length; ++index) {
                var data = result[index];
                if (data[xVarName] == chartData[i][xVarName]) {
                    // result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                }
            }
            if (hasMatch == false) {
                let ditem = {};
                ditem[xVarName] = chartData[i][xVarName];
                ditem[yVarName] = chartData[i][yVarName];
                ditem["title"] = opts[0].captions != undefined ? opts[0].captions.find((op) => op['acronym'] == chartData[i][xVarName])['title']  : "";
                ditem["op"] = 1;
                ditem["total"] = chartData.filter(c => c['moduleGroup'] == ditem[xVarName]).map(c => c.ects).reduce((a, b) => a + b, 0)
                result.push(ditem);

                resultColors[counter] = opts[0].color != undefined ? opts[0].color[0][chartData[i][xVarName]] : "";

                counter += 1;
            }
        }
    }
    runningData = result;
    runningColors = resultColors;
    return;
}