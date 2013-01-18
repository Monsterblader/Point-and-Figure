//Fix chart sizes in html template

SectorList = new Meteor.Collection("sectors");
SectorStockList = new Meteor.Collection("sectorStocksList");
StockData = new Meteor.Collection("stockData");
ChartHistory = new Meteor.Collection("chartHistory");

var DEBUGON = true;

if (Meteor.isClient) {
  Template.sectorMenu.sectorList = function (){
    return SectorList.find();
  };

  Template.sectorStockMenu.sectorStockList = function (){
    return SectorStockList.find({/*How to get sector name from loop*/});
  };

  Template.insertTabs.tabList = function (){
    DEBUGON && console.log("tabList");
    // TODO How do I limit the number of items that get returned to the template.
    // DEBUGON && console.log("tabList");
    // var tabs = _.uniq(ChartHistory.find({}, {sort: {date: -1}}).fetch()).slice(5);
    return ChartHistory.find({}, {sort: {stock: 1}});
  };

  Template.renderChart.stockData = function (){
    DEBUGON && console.log("stockData", 1);
    var tickerSymb = $("#tickerInput").val();
    StockData.findOne({chart: tickerSymb})
  };

  Template.renderChart.rendered = function (){
    var tickerSymb = $("#tickerInput").val();
    if (StockData.findOne({chart: tickerSymb})) {
      DEBUGON && console.log("rendered");
      var savedData = StockData.findOne({chart: tickerSymb}).data
      var priceRange = findRange(savedData);
      var chartWidth = 600;
      var chartHeight = Math.max(300, (priceRange.high - priceRange.low) * 10);
      $(".chartGroup").remove();
      //Move the following line to its template?
      $("#chartBox").append("<canvas class='pnfChart chartGroup' id='" + tickerSymb + "Chart' width='" + chartWidth + "' height='" + chartHeight + "'></canvas>");
      $("#companyName").html(tickerSymb.toUpperCase());
      $("#tickerInput").val("");
      var canvas = document.getElementById(tickerSymb + "Chart");
      canvas.getContext && webkitRequestAnimationFrame(function (){
        createChart(canvas.getContext("2d"), savedData, priceRange, chartHeight);
      });
    }
  }

  Template.insertTabs.events({
    "click": function (){
      DEBUGON && console.log("click", this.stock);
      $("#tickerInput").val(this.stock);
      Meteor.call("loadChart", this.stock);
    }
  });

  Template.getChart.events({
    'click button': function (){
      DEBUGON && console.log("click button");
      Meteor.call("loadChart", $("#tickerInput").val());
    },

    'keyup input': function (e){
      if (e.which === 13) {
        DEBUGON && console.log("keyup input");
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
    /* I have only been able to find one configuration which executes/renders/rendered correctly.  That requires using the StockData collection and lines of code as noted. */
    loadChart: function (tickerSymb){
      DEBUGON && console.log("loadChart", tickerSymb);
      var todayms = new Date();
      var stockArray = [];
      // TODO if time of request after market close, use today's date, else use yesterday's date.
      var today = new Date(todayms - (1000 * 60 * 60 * 24));
      var startDate = new Date(todayms - (1000 * 60 * 60 * 24 * 61));
      var abc = "&a=" + startDate.getMonth() + "&b=" + startDate.getDate() + "&c=" + startDate.getFullYear();
      var def = "&d=" + today.getMonth() + "&e=" + today.getDate() + "&f=" + today.getFullYear();
      var chartReq = "http://ichart.yahoo.com/table.csv?s=" + tickerSymb + abc + def + "&g=d&ignore=.csv";
      /* DO NOT REMOVE THE FOLLOWING LINE OF CODE!!!  The program does not function without the following line of code for whatever reason. */
      StockData.insert({ticker: tickerSymb});
      ChartHistory.insert({stock: tickerSymb, date: new Date().getTime()});
      Meteor.http.get(chartReq, function(err, response){
        stockArray = response.content
                      .split(",")
                      .slice(10)
                      .filter(function (val, key){ return (key % 6) === 0; })
                      .map(function (val, key){ return parseFloat(val); });
        /* DO NOT REMOVE THE FOLLOWING LINE OF CODE!!!  The program does not function without the following line of code for whatever reason. */
        StockData.remove({});
        StockData.insert({chart: tickerSymb, data: stockArray});        
      });
      DEBUGON && console.log("end loadChart");
    }
  });
}
