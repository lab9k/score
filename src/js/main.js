window.onload = function() {
  resizeSVG();
  //var chartBuilder = new circlePacking();
  var chartBuilder = new cityPacking();
  chartBuilder.createChart();
};

var resizeSVG = function() {
  var height = window.innerHeight;
  var svg = document.getElementById("chart");
  svg.setAttribute("width", "" + height);
  svg.setAttribute("height", "" + height);
};
