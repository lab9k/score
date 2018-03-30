function cityPacking() {}
cityPacking.prototype.createChart = function() {
  var id = "1adKrrgn-KxFe1mWHUXZEDvu23BIzHE2wLk2YfIQjzbM";
  var sheet_index = "2";
  var sds = new SpreadsheetDataService(id, sheet_index);
  sds
    .fetch()
    .then(rows => {
      // parse rows
      return rows;
    })
    .then(data => {
      console.log(data);
    })
    .catch(console.error);
};
