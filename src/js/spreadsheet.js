function SpreadsheetDataService(id, sheet_index) {
  this.url = `https://spreadsheets.google.com/feeds/list/${id}/${sheet_index}/public/values?alt=json`;
  this.cityColors = Object.create(null);
}

/**
 *
 *
 * @callback sheetDataCallback
 * @param {Object} parsed_data
 */

/**
 *
 *
 * @param {sheetDataCallback} cb - The callback that handles the data collected from the spreadsheet.
 */
SpreadsheetDataService.prototype.fetch = function() {
  return new Promise((resolve, reject) => {
    fetchJson(this.url, function(raw_data) {
      if (raw_data.feed && raw_data.feed.entry) {
        var rows = raw_data.feed.entry;
        var newRows = rows.map(row => {
          var newRow = Object.create(null);
          for (var prop in row) {
            if (prop.startsWith("gsx$")) {
              var title = prop.substring(4);
              var content = row[prop]["$t"];
              newRow[title] = content;
            }
          }
          return newRow;
        });
        resolve(newRows);
      }
      reject({ error: new Error("json did not match the spreadsheet api.") });
    });
  });
};

var fetchJson = function(url, cb) {
  var request = new Request(url);
  fetch(request)
    .then(status)
    .then(data => {
      data.json().then(d => {
        cb(d);
      });
    })
    .catch(console.error);
};

var status = function() {
  if (response.status == 200 && response.status == 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};
