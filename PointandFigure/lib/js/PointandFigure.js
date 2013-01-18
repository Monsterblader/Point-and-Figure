SectorList = new Meteor.Collection("sectors");
SectorStockList = new Meteor.Collection("sectorStocksList");
StockData = new Meteor.Collection("stockData");

if (Meteor.isClient) {
  Template.sectorMenu.sectorList = function (){
    return SectorList.find();
  };

  Template.sectorStockMenu.sectorStockList = function (){
    return SectorStockList.find({/*How to get sector name from loop*/});
  };

  Template.insertTabs.tabList = function (){
    return StockData.find();
  };

  Template.renderChart.draw = function (){
    var tickerSymb = $("#tickerInput").val();
    StockData.findOne({chart: tickerSymb})
  };

  Template.renderChart.rendered = function (){
    var tickerSymb = $("#tickerInput").val();
    if (StockData.findOne({chart: tickerSymb})) {
      console.log("rendered");
      var savedData = StockData.findOne({chart: tickerSymb}).data
      var priceRange = findRange(savedData);
      var chartWidth = 600;
      var chartHeight = Math.max(300, (priceRange.high - priceRange.low) * 10);
      $(".chartGroup").remove();
      $("#chartBox").append("<canvas class='pnfChart chartGroup' id='" + tickerSymb + "Chart' width='" + chartWidth + "' height='" + chartHeight + "'></canvas></div>");
      $("#companyName").html(tickerSymb.toUpperCase());
      $("#tickerInput").val("");
      var canvas = document.getElementById(tickerSymb + "Chart");
      canvas.getContext && webkitRequestAnimationFrame(function (){
        createChart(canvas.getContext("2d"), savedData, priceRange, chartHeight);
      });
    }
  }

  Template.getChart.events({
    'click button': function (){
      Meteor.call("loadChart", $("#tickerInput").val());
    },

    'keyup input': function (e){
      if (e.which === 13) {
        Meteor.call("loadChart", $("#tickerInput").val());
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (SectorList.find().count() === 0) {
      ["Indices", "Basic Materials", "Conglomerates", "Consumer Goods", "Financial", "Healthcare", "Industrial Goods", "Services", "Technology", "Utilities"].forEach(function(element){
        SectorList.insert({sector: element});
      });
    }
    if (SectorStockList.find().count() === 0) {
      // TODO populate SectorStockList by {sector: ..., stock: ...}
    }
  });
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
      StockData.insert({ticker: tickerSymb})
      Meteor.http.get(chartReq, function(err, response){
        stockArray = response.content
                      .split(",")
                      .slice(10)
                      .filter(function (val, key){ return (key % 6) === 0; })
                      .map(function (val, key){ return parseFloat(val); });
        StockData.remove({});
        // if (StockData.find({chart: tickerSymb}).count()) {
        //   StockData.update({chart: tickerSymb, data: stockArray});
        // } else {
          StockData.insert({chart: tickerSymb, data: stockArray});        
        // }
      });
    }
  });
}
