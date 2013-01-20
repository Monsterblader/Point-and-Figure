if (Meteor.isClient) {
  Template.insertTabs.tabList = function (){
    return ChartHistory.find({}, {sort: {date: -1}, limit: 10});
  };

  Template.renderChart.stockData = function (){
    // None of this really does anything except trigger the .rendered function.
    var tickerSymb = Session.get("currChartSymb");
    ChartHistory.findOne({stock: tickerSymb});
  };

  var testme = function(){
    console.log("You are here");
  }

  Template.renderChart.rendered = function (){
    testme();
    var tickerSymb = Session.get("currChartSymb");
    var thing = ChartHistory.findOne({stock: tickerSymb});
    if (thing) {
      var savedData = ChartHistory.findOne({stock: tickerSymb}).data
      var priceRange = findRange(savedData);
      var chartWidth = 600;
      var chartHeight = Math.max(300, (priceRange.high - priceRange.low) * 10);
      $(".chartGroup").remove();
      //Move the following line to its template?
      $("#chartBox").append("<canvas class='pnfChart chartGroup' id='" + tickerSymb + "Chart' width='" + chartWidth + "' height='" + chartHeight + "'></canvas>");
      $("#tickerInput").val("");
      var canvas = document.getElementById(tickerSymb + "Chart");
      canvas.getContext && webkitRequestAnimationFrame(function (){
        createChart(canvas.getContext("2d"), savedData, priceRange, chartHeight);
      });
    }
  }

  Template.insertTabs.events({
    "click": function (){
      Session.set("currChartSymb", this.stock);
      Meteor.call("loadChart", this.stock);
    }
  });

  var setupChart = function (){
    var input =  $("#tickerInput").val();
    Session.set("currChartSymb", input);
    Meteor.call("loadChart", input);
  };

  Template.searchForm.events({
    'click button': setupChart,
    'keyup input': function(e){
      if(e.keyCode === 13){
        setupChart();
      }
    }
  });
}
