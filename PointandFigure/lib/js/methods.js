if (Meteor.isServer) {
  Meteor.methods({
    loadChart: function (tickerSymb){
      var todayms = new Date();
      var stockArray = [];
      // TODO if time of request after market close, use today's date, else use yesterday's date.
      var today = new Date(todayms - (1000 * 60 * 60 * 24));
      var startDate = new Date(todayms - (1000 * 60 * 60 * 24 * 61));
      var abc = "&a=" + startDate.getMonth() + "&b=" + startDate.getDate() + "&c=" + startDate.getFullYear();
      var def = "&d=" + today.getMonth() + "&e=" + today.getDate() + "&f=" + today.getFullYear();
      var chartReq = "http://ichart.yahoo.com/table.csv?s=" + tickerSymb + abc + def + "&g=d&ignore=.csv";
      var companyPage = "http://finance.yahoo.com/q?s=" + tickerSymb + "&ql=1";
      Meteor.http.get(companyPage, function (err, response){
        // Do I need to test that the entry already exists?
        var nameIndex = response.content.search(/class=\"title\"><h2>/);
        var result = response.content.slice(nameIndex + 18, nameIndex + 100);
        var regex = /^[^<]+/;
        var companyName = regex.exec(result)[0];
        nameIndex = response.content.search("Market Cap:</th>");
        result = response.content.slice(nameIndex + 68, nameIndex + 88);
        var marketCap = regex.exec(result)[0];
        nameIndex = response.content.search('P/E ');
        result = response.content.slice(nameIndex + 70, nameIndex + 80);
        var PtoE = regex.exec(result)[0];
        nameIndex = response.content.search('EPS ');
        result = response.content.slice(nameIndex + 70, nameIndex + 80);
        var EPS = regex.exec(result)[0];
        nameIndex = response.content.search('Yield:');
        result = response.content.slice(nameIndex + 39, nameIndex + 59);
        var DivandYield = regex.exec(result)[0];
        // temporary.insert({ticker: tickerSymb, name: regex.exec(result)[0]});
        // Can this be refactored?
        if (ChartHistory.find({stock: tickerSymb}).count() === 0) {
          ChartHistory.insert({stock: tickerSymb, date: [new Date().getTime()], popularity: 1,
                               name: companyName, marketCap: marketCap, PtoE: PtoE, EPS: EPS, DivandYield: DivandYield});
        } else {
          var updatedEntry = ChartHistory.findOne({stock: tickerSymb});
          updatedEntry.date.unshift(new Date().getTime());
          updatedEntry.popularity += 1;
          ChartHistory.update({stock: tickerSymb}, updatedEntry);
        }
      });
      Meteor.http.get(chartReq, function(err, response){
        stockArray = response.content
                      .split(",")
                      .slice(10)
                      .filter(function (val, key){ return (key % 6) === 0; })
                      .map(function (val, key){ return parseFloat(val); });
        StockData.insert({chart: tickerSymb, data: stockArray});
      });
    }
  });
}
