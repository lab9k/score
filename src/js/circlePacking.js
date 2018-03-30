function circlePacking() {}
circlePacking.prototype.createChart = function() {
  var id = "1adKrrgn-KxFe1mWHUXZEDvu23BIzHE2wLk2YfIQjzbM";
  var sheet_index = "2";
  var dataService = new SpreadsheetDataService(id, sheet_index);
  var cities = [];
  dataService
    .fetch()
    .then(rows => {
      console.log("rows: ", rows);
      var parsed_json = Object.create(null);
      parsed_json["name"] = "score";
      parsed_json["children"] = [];
      rows.forEach(row => {
        var themeValue = row["theme"];
        var kwValue = row["keyword"];
        var titleValue = row["title"];
        var descriptionValue = row["description"];
        var contactValue = row["contact"];
        var cityValue = row["city"];
        if (!cities.includes(cityValue)) {
          cities.push(cityValue);
        }
        var rowObj = {
          name: titleValue,
          description: descriptionValue,
          contact: contactValue,
          city: cityValue,
          size: 256,
          leaf: true
        };
        var themeObj = parsed_json.children.find(el => {
          return el.name === themeValue;
        });
        if (!themeObj) {
          themeObj = { name: themeValue, children: [], kind: "THEME" };
          themeObj.children.push({ name: kwValue, children: [rowObj] });
          parsed_json.children.push(themeObj);
        } else {
          var kwObj = themeObj.children.find(el => {
            return el.name === kwValue;
          });
          if (!kwObj) {
            themeObj.children.push({
              name: kwValue,
              children: [rowObj],
              kind: "KEYWORD"
            });
          } else {
            kwObj.children.push(rowObj);
          }
        }
      });

      return parsed_json;
    })
    .then(data => {
      var cityColors = createColors(cities);
      var svg = d3.select("#chart"),
        margin = 10,
        diameter = +svg.attr("width"),
        g = svg
          .append("g")
          .attr(
            "transform",
            "translate(" + diameter / 2 + "," + diameter / 2 + ")"
          );
      var color = d3
        .scaleLinear()
        .domain([-1, 5])
        .range(["hsl(195,80%,80%)", "hsl(228,30%,40%)"])
        .interpolate(d3.interpolateHcl);
      var pack = d3
        .pack()
        .size([diameter - margin, diameter - margin])
        .padding(3);

      var root = data;
      root = d3
        .hierarchy(root)
        .sum(function(d) {
          return d.size;
        })
        .sort(function(a, b) {
          return b.value - a.value;
        });

      var focus = root,
        nodes = pack(root).descendants(),
        view;

      var circle = g
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", function(d) {
          return d.parent
            ? d.children ? "node" : "node node--leaf"
            : "node node--root";
        })
        .style("fill", function(d) {
          return d.children ? color(d.depth) : null;
        })
        .on("click", function(d) {
          if (d.data.leaf) {
            openUrl(d.data.contact);
          } else {
            if (focus !== d) zoom(d);
          }
          d3.event.stopPropagation();
        });

      /*var text =*/ g
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("fill-opacity", function(d) {
          return d.parent === root ? 1 : 0;
        })
        .style("display", function(d) {
          return d.parent === root ? "inline" : "none";
        })
        .attr("fill", function(d) {
          return d.data.leaf ? "inherit" : "inherit";
        })
        .text(function(d) {
          return d.data.name;
        });

      var node = g.selectAll("circle,text");

      svg.style("background", color(-1)).on("click", function() {
        zoom(root);
      });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        //var focus0 = focus;
        focus = d;

        var transition = d3
          .transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween("zoom", function(/*d*/) {
            var i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2 + margin
            ]);
            return function(t) {
              zoomTo(i(t));
            };
          });

        transition
          .selectAll("text")
          .filter(function(d) {
            return d.parent === focus || this.style.display === "inline";
          })
          .style("fill-opacity", function(d) {
            return d.parent === focus ? 1 : 0;
          })
          .on("start", function(d) {
            if (d.parent === focus) this.style.display = "inline";
          })
          .on("end", function(d) {
            if (d.parent !== focus) this.style.display = "none";
          });
      }

      function zoomTo(v) {
        var k = diameter / v[2];
        view = v;
        node.attr("transform", function(d) {
          return (
            "translate(" +
            (d.x - v[0]) * k +
            "," +
            (d.y - v[1]) * k +
            ") rotate(" +
            15 +
            ")"
          );
        });
        circle.attr("r", function(d) {
          return d.r * k;
        });
      }
      function colorCallback(options) {
        g
          .selectAll("circle")
          .data(nodes)
          .style("fill", function(d) {
            if (d.data.leaf && options && options[d.data.city]) {
              return cityColors[d.data.city];
            } else return d.children ? color(d.depth) : null;
          });
      }
      createCheckboxes(cityColors, colorCallback);
    })
    .catch(console.error);
};
var createColors = function(cities) {
  cities.sort();
  var cityColors = Object.create(null);
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const color = randomColor({ luminosity: "light" });
    cityColors[city] = color;
  }
  return cityColors;
};

var createCheckboxes = function(cityColors, cb) {
  var list = document.getElementById("checkboxes");
  if (list.firstChild) {
    return;
  }
  for (const city in cityColors) {
    const color = cityColors[city];
    var label = document.createElement("label");
    var input = document.createElement("input");
    var span = document.createElement("span");
    var colorSpan = document.createElement("span");
    colorSpan.style.backgroundColor = color;
    colorSpan.setAttribute("class", "legend");
    colorSpan.innerHTML = "&nbsp";

    input.setAttribute("type", "checkbox");
    input.setAttribute("value", city);
    input.setAttribute("id", city + "cbId");
    input.addEventListener("change", function() {
      var options = Object.create(null);
      var checkedCityNodes = document.querySelectorAll("input:checked");
      checkedCityNodes.forEach(el => {
        options[el.value] = true;
      });
      cb(options);
    });
    span.innerText = city;

    list.appendChild(label);
    label.appendChild(input);
    label.appendChild(span);
    label.appendChild(colorSpan);
  }
};
var openUrl = function(url) {
  var win = window.open(url, "_blank");
  win.focus();
};
