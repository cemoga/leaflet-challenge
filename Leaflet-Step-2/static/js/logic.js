// Create a map object
var myMap = L.map("map", {
    center: [15.5994, -28.6731],
    zoom: 3
});

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-basic",
    accessToken: API_KEY
}).addTo(myMap);

// API
var URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

console.log(URL)

// Modify the size of the Markers
function markerSize(mag) {
    return mag * 70000;
}

// Return max and minimun magnitudes and create buckets for colors
d3.json(URL, function (response) {
    var magnitudes = []
    for (var i = 0; i < response.metadata.count; i++) {
        magnitudes.push(response.features[i].properties.mag)
    };
    console.log(magnitudes)
    maxMag = magnitudes.reduce(function (a, b) {
        return Math.max(a, b);
    });
    minMag = magnitudes.reduce(function (a, b) {
        return Math.min(a, b);
    });
    console.log("Max Magnitude: ", maxMag)
    console.log("Min Magnitude: ", minMag)

    if (minMag < 0) {
        // There are cases when the magnitude is less than zero
        minMag = 0
    }

    // Magnitude increments for change in color (6 buckets)
    incColor = (maxMag - minMag) / 6

    // Buckets 6
    bucket_1 = minMag + incColor * 1
    bucket_2 = minMag + incColor * 2
    bucket_3 = minMag + incColor * 3
    bucket_4 = minMag + incColor * 4
    bucket_5 = minMag + incColor * 5
    bucket_6 = minMag + incColor * 6
});

// Create the markers and assing them a color
d3.json(URL, function (response) {
    console.log("Total Records: ", response.metadata.count)
    console.log("Latitude 1st: ", response.features[0].geometry.coordinates[1])
    console.log("Long 1st: ", response.features[0].geometry.coordinates[0])
    console.log("Magnitude 1st: ", response.features[0].properties.mag)
    console.log("Place: ", response.features[0].properties.place)

    var reportUpdateMilisecs = response.metadata.generated
    reportUpdate = new Date(reportUpdateMilisecs)
    reportUpdateDate = reportUpdate.toLocaleDateString('en-US')
    reportUpdateTime = reportUpdate.toLocaleTimeString('en-US')

    console.log("Report Update: ", reportUpdateDate, reportUpdateTime)


    for (var i = 0; i < response.metadata.count; i++) {
        var mag = response.features[i].properties.mag
        var miliseconds = response.features[i].properties.time
        var date = new Date(miliseconds)
        var dateSpot = date.toLocaleDateString('en-US')
        var timeSpot = date.toLocaleTimeString('en-US')
        var place = response.features[i].properties.place
        var lat = response.features[i].geometry.coordinates[1]
        var long = response.features[i].geometry.coordinates[0]
        var location = [lat, long];

        var color = "";
        if (mag < bucket_1) {
            var color = "#00CC10";
        }
        else if (mag < bucket_2) {
            var color = "#48D100";
        }
        else if (mag < bucket_3) {
            var color = "#A6D600";
        }
        else if (mag < bucket_4) {
            var color = "#DBAD00";
        }
        else if (mag < bucket_5) {
            var color = "#E05100";
        }
        else {
            var color = "#E5000E";
        }

        L.circle(location, {
            stroke: true,
            color: "white", // stroke
            width: 1, // stroke
            fillColor: color,
            fillOpacity: 0.80,
            // Setting our circle's radius equal to the output of our markerSize function
            // This will make our marker's size proportionate to its points
            radius: markerSize(mag)
        }).bindPopup("<h3>" + place + "</h3> <hr> <p><b>Magnitude: </b>" + mag +
            "<br><b>Date: </b>" + dateSpot +
            "<br><b>Time: </b>" + timeSpot).addTo(myMap);
        // Call the updateLegend function, which will... update the legend!
        updateLegend(reportUpdate);
    }
});

// Create a legend to display information about our map
var info = L.control({
    position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function () {
    var div = L.DomUtil.create("div", "legend");
    return div;
};
// Add the info legend to the map
info.addTo(myMap);

function updateLegend(time) {
    document.querySelector(".legend").innerHTML = [
        "<p><b>Updated: </b> <br>" + reportUpdateDate +"<br>"+ reportUpdateTime + "</p><hr>",
        "<p class='one'>" + "&#9632;" + "</p><p id='in-line'>" + "0-" + bucket_1 + "</p><br>",
        "<p class='two'>" + "&#9632;" + "</p><p id='in-line'>" + bucket_1 + "-" + bucket_2 + "</p><br>",
        "<p class='three'>" + "&#9632;" + "</p><p id='in-line'>" + bucket_2 + "-" + bucket_3 + "</p><br>",
        "<p class='four'>" + "&#9632;" + "</p><p id='in-line'>" + bucket_3 + "-" + bucket_4 + "</p><br>",
        "<p class='five'>" + "&#9632;" + "</p><p id='in-line'>" + bucket_4 + "-" + bucket_5 + "</p><br>",
        "<p class='six'>" + "&#9632;" + "</p><p id='in-line'>" + "> " + bucket_5 + "</p>"
    ].join("");
}