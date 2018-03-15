function SpreadsheetDataService() {
  this.url =
    "https://spreadsheets.google.com/feeds/list/1adKrrgn-KxFe1mWHUXZEDvu23BIzHE2wLk2YfIQjzbM/o19znhx/public/values?alt=json";
}

SpreadsheetDataService.prototype.fetch = function(cb) {
  /*fetchJson(this.url, function(raw_data) {
    var parsed_json = Object.create({});
    if (raw_data.feed && raw_data.feed.entry) {
      parsed_json["name"] = "score";
      parsed_json["children"] = [];
      var temp = Object.create({});
      raw_data.feed.entry.forEach(row => {
        if (row["gsx$keyword"]["$t"] !== "") {
          //new keyword
          parsed_json["children"].push(temp);
          temp = Object.create({});
          temp["name"] = row["gsx$keyword"]["$t"];
          temp["children"] = [];
        } else {
          //create children
          var children = temp["children"];
          children.push({ name: row["gsx$title"]["$t"], size: 256 });
        }
      });
    }
    console.log("Parsed JSON: ", parsed_json);
    cb(parsed_json);
  });*/
  fetchJson(this.url, function(raw_data) {
    var parsed_json = Object.create({});
    if (raw_data.feed && raw_data.feed.entry) {
      parsed_json["name"] = "score";
      parsed_json["children"] = [];
      var rows = raw_data.feed.entry;
      rows.forEach(row => {
        /*
        var kwChildren = main.children[THEME].children[KEYWORD].children.push({name:title,...})
        */

        var themeValue = row["gsx$theme"]["$t"];
        var kwValue = row["gsx$keyword"]["$t"];
        var titleValue = row["gsx$title"]["$t"];
        var descriptionValue = row["gsx$description"]["$t"];
        var contactValue = row["gsx$contact"]["$t"];
        var cityValue = row["gsx$city"]["$t"];

        var rowObj = {
          name: titleValue,
          description: descriptionValue,
          contact: contactValue,
          city: cityValue,
          size: 256
        };

        var themeObj = parsed_json.children.find(el => {
          return el.name === themeValue;
        });
        if (!themeObj) {
          themeObj = { name: themeValue, children: [] };
          themeObj.children.push({ name: kwValue, children: [rowObj] });
          parsed_json.children.push(themeObj);
        } else {
          var kwObj = themeObj.children.find(el => {
            return el.name === kwValue;
          });
          if (!kwObj) {
            themeObj.children.push({ name: kwValue, children: [rowObj] });
            parsed_json.children.push(themeObj);
          } else {
            kwObj.children.push(rowObj);
          }
        }
      });
    }
    console.log("Parsed JSON: ", parsed_json);
    cb(parsed_json);
  });
};

var fetchJson = function(url, cb) {
  var request = new Request(url);
  fetch(request)
    .then(status)
    .then(data => {
      data.json().then(d => {
        console.log(d);
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
