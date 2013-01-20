if (Meteor.isServer) {
  var getCompanyInformation = function (chunk, updatedEntry){
    var REGEX = /^[^<]+/;
    var companyKeys = ["name", "marketCap", "PtoE", "EPS", "DivandYield"];
    var searchValues = ['class=\"title\"><h2>', "Market Cap:</th>", "P/E ", "EPS ", "Yield:"];
    var startOffsets = [18, 68, 70, 70, 39];
    var endOffsets = [100, 88, 80, 80, 59];
    var nameIndex;
    var result;
    for (var i = 0; i < 5; i += 1) {
      nameIndex = chunk.search(searchValues[i]);
      result = chunk.slice(nameIndex + startOffsets[i], nameIndex + endOffsets[i]);
      updatedEntry[companyKeys[i]] = REGEX.exec(result)[0];
    };
    return updatedEntry;
  };

  var chartURL = function (tickerSymb){
    var todayms = new Date();
    var today = new Date(todayms - (1000 * 60 * 60 * 24));
    var startDate = new Date(todayms - (1000 * 60 * 60 * 24 * 61));
    var abc = "&a=" + startDate.getMonth() + "&b=" + startDate.getDate() + "&c=" + startDate.getFullYear();
    var def = "&d=" + today.getMonth() + "&e=" + today.getDate() + "&f=" + today.getFullYear();
    return "http://ichart.yahoo.com/table.csv?s=" + tickerSymb + abc + def + "&g=d&ignore=.csv";
  };

  Meteor.methods({
    loadChart: function (tickerSymb){
      // TODO if time of request after market close, use today's date, else use yesterday's date.
      var chartReq = chartURL(tickerSymb);
      var companyPage = "http://finance.yahoo.com/q?s=" + tickerSymb + "&ql=1";
      Meteor.http.get(chartReq, function(err, response){
        var stockArray = response.content
                      .split(",")
                      .slice(10)
                      .filter(function (val, key){ return (key % 6) === 0; })
                      .map(function (val){ return parseFloat(val); });
        // Actually, this needs to update periodically.  How to determine frequency?
        if (ChartHistory.find({stock: tickerSymb}).count() === 0) {
          ChartHistory.insert({stock: tickerSymb, data: stockArray, date: [new Date().getTime()], popularity: 1});
          Meteor.http.get(companyPage, function (err, response){
            var updatedEntry = ChartHistory.findOne({stock: tickerSymb});
            ChartHistory.update({stock: tickerSymb}, getCompanyInformation(response.content, updatedEntry));
          });
        } else {
          var updatedEntry = ChartHistory.findOne({stock: tickerSymb});
          updatedEntry.data = stockArray;
          updatedEntry.date.unshift(new Date().getTime());
          updatedEntry.popularity += 1;
          ChartHistory.update({stock: tickerSymb}, updatedEntry);
        }
      });
    }
  });
}
