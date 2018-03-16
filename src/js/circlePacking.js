var createChart = function(options) {
  var dataService = new SpreadsheetDataService();
  dataService.fetch(function(data) {
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

    //d3.json(data, function(error, root) {
    //if (error) throw error;
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
        if (d.data.leaf && options && options[d.data.city]) {
          return dataService.cityColors[d.data.city];
        } else return d.children ? color(d.depth) : null;
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
      var circle = g
        .selectAll("circle")
        .data(nodes)
        .style("fill", function(d) {
          if (d.data.leaf && options && options[d.data.city]) {
            return dataService.cityColors[d.data.city];
          } else return d.children ? color(d.depth) : null;
        });
    }
    createCheckboxes(dataService, colorCallback);
  });
};

var createCheckboxes = function(dataService, cb) {
  var list = document.getElementById("checkboxes");
  if (list.firstChild) {
    return;
  }
  var cityColors = dataService.cityColors;
  for (const city in cityColors) {
    console.log(city);
    const color = cityColors[city];
    var label = document.createElement("label");
    var input = document.createElement("input");
    var span = document.createElement("span");
    input.setAttribute("type", "checkbox");
    input.setAttribute("value", city);
    input.setAttribute("id", city + "cbId");
    input.addEventListener("change", function(event) {
      console.log("checkbox clicked: ", city);
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
  }
};

var resizeSVG = function() {
  var height = window.innerHeight;
  var svg = document.getElementById("chart");
  svg.setAttribute("width", "" + height);
  svg.setAttribute("height", "" + height);
};

window.onload = function() {
  resizeSVG();
  createChart();
};

var openUrl = function(url) {
  var win = window.open(url, "_blank");
  win.focus();
};
