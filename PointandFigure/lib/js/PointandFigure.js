//Fix chart sizes in html template

SectorList = new Meteor.Collection("sectors");
SectorStockList = new Meteor.Collection("sectorStocksList");
StockData = new Meteor.Collection("stockData");
ChartHistory = new Meteor.Collection("chartHistory");

var DEBUGON = false;

if (Meteor.isClient) {
  // Session.set("ticker", null);
  Template.sectorMenu.sectorList = function (){
    return SectorList.find();
  };

  Template.sectorStockMenu.sectorStockList = function (){
    return SectorStockList.find({/*How to get sector name from loop*/});
  };

  Template.trendingMenu.trendList = function (){
    return ChartHistory.find({}, {sort: {popularity: -1}});
  };

  // Template.headerInformation.header = function (){
  //   // Do I need to run this externally?  This seems to be running on Session.set which executes before data are collected.
  //   // if (Session.get("ticker") !== null) {
  //   //   console.log(Session.get("ticker"), new Date().getTime());
  //   //   debugger
  //   //   var temp = ChartHistory.findOne({stock: Session.get("ticker")});
  //   //   console.log(temp, new Date().getTime());
  //   //   return temp.name;
  //   // } else {
  //     return "No chart selected";
  //   // }
  // };

  Template.insertTabs.tabList = function (){
    DEBUGON && console.log("tabList");
    return ChartHistory.find({}, {sort: {date: -1}, limit: 10});
  };

  Template.renderChart.stockData = function (){
    // None of this really does anything except trigger the .rendered function.
    DEBUGON && console.log("stockData", 1);
    var tickerSymb = Session.get("ticker");
    StockData.findOne({chart: tickerSymb});
  };

  Template.renderChart.rendered = function (){
    console.log("rendered", new Date().getTime());
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
      // $("#companyName").html(tickerSymb.toUpperCase());
      $("#tickerInput").val("");
      var canvas = document.getElementById(tickerSymb + "Chart");
      canvas.getContext && webkitRequestAnimationFrame(function (){
        createChart(canvas.getContext("2d"), savedData, priceRange, chartHeight);
      });
    }
  }

  // var chartSetup = function (chart){
  //   console.log("chartSetup", new Date().getTime());
  //   // setTimeout(function(){

  //   // Session.set("ticker", chart);
  //   // }, 2000);
  //   Meteor.call("loadChart", chart);
  // }

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
      console.log("loadChart", new Date().getTime());
      DEBUGON && console.log("loadChart", tickerSymb);
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
        console.log("companyPage", new Date().getTime());
        // Do I need to test that the entry already exists?
        var nameIndex = response.content.search(/class=\"title\"><h2>/);
        var result = response.content.slice(nameIndex + 18, nameIndex + 100);
        var regex = /^[^<]+/;
        var companyName = regex.exec(result)[0];
        // temporary.insert({ticker: tickerSymb, name: regex.exec(result)[0]});
        // Can this be refactored?
        if (ChartHistory.find({stock: tickerSymb}).count() === 0) {
          ChartHistory.insert({stock: tickerSymb, date: [new Date().getTime()], popularity: 1, name: companyName});
          DEBUGON && console.log("ChartHistory === 0", ChartHistory.findOne({stock: tickerSymb}));
        } else {
          var updatedEntry = ChartHistory.findOne({stock: tickerSymb});
          updatedEntry.date.unshift(new Date().getTime());
          updatedEntry.popularity += 1;
          ChartHistory.update({stock: tickerSymb}, updatedEntry);
          DEBUGON && console.log("ChartHistory truthy", ChartHistory.findOne({stock: tickerSymb}));
        }
      });
      /* DO NOT REMOVE THE FOLLOWING LINE OF CODE!!!  The program does not function without the following line of code for whatever reason. */
      StockData.insert({ticker: tickerSymb});
      Meteor.http.get(chartReq, function(err, response){
        console.log("chartReq", new Date().getTime());
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
