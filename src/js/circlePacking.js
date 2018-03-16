var createChart = function() {
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
        return d.children ? color(d.depth) : null;
      })
      .on("click", function(d) {
        if (focus !== d) zoom(d), d3.event.stopPropagation();
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
      .attr("leaf", function(d) {
        return d.data.leaf ? true : false;
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
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
      });
      circle.attr("r", function(d) {
        return d.r * k;
      });
    }
  });
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

// window.onresize = function() {
//   console.log("resizing.");
//   var svg_cont = document.getElementById("svg-cont");
//   svg_cont.removeChild(document.getElementById("chart"));
//   var newElem = document.createElement("svg");
//   newElem.setAttribute("id", "chart");
//   svg_cont.appendChild(newElem);
//   resizeSVG();
//   createChart();
// };
