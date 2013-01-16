SectorList = new Meteor.Collection("sectors");
SectorStockList = new Meteor.Collection("sectorStocksList");
StockData = new Meteor.Collection("stockData");

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to PointandFigure.";
  };

  Template.sectorMenu.sectorList = function (){
    return SectorList.find();
  };

  Template.sectorStockMenu.sectorStockList = function (){
    return SectorStockList.find({/*How to get sector name from loop*/});
  };

  Template.renderChart.draw = function (){
  };

  Template.renderChart.rendered = function (){
    // BEGIN stock render script
    var findRange = function (prices){
      var extremes = {high: prices[0], low: prices[0]};
      prices.forEach(function (val){
        (val > extremes.high) ? (extremes.high = val) :
        (val < extremes.low) && (extremes.low = val);
      });
      return extremes;
    };

    var createChart = function (ctx, prices, priceRange, chartHeight){
      var drawLine = function (ctx, startPoint, endPoint, lineColor){
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }

      var makePoint = function (X, Y){
        return {x: X, y: Y};
      }

      var drawAxes = function (ctx, top, bottom, scale){
        var labelAxis = function (ctx, priceRange){
          ctx.font = "12px Times New Roman";
          ctx.fillStyle = "Black";
          var high = Math.max(Math.floor(priceRange.high) + 1, 30);
          var low = Math.min(high - 30, priceRange.low);
          for (var i = high; i >= low; i -= 1) {
            ctx.fillText(i, 1, (high - i + 1) * 10);
          }
        }

        ctx.clearRect(0,0,300,300);
        // This section taken from http://www.w3schools.com/tags/canvas_fillstyle.asp
        var my_gradient=ctx.createLinearGradient(0, 0, 0, chartHeight / 2);
        my_gradient.addColorStop(0,"gray");
        my_gradient.addColorStop(1,"white");
        ctx.fillStyle=my_gradient;
        ctx.fillRect(0, 0, 300, chartHeight);
        // End section
        ctx.shadowColor = undefined;
        var axisLeftOffset = Math.max(16, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 2) * 5) + 1;
        drawLine(ctx, makePoint(axisLeftOffset, 0), makePoint(axisLeftOffset, chartHeight), "black");
        // Following line is no longer needed?
        // drawLine(ctx, makePoint(0, 150), makePoint(300, 150), "black");
        labelAxis(ctx, priceRange);
      };

      var detectTrend = function (trend, prices, key){
        var delta = prices[key] - prices[key - 1]; 
        return trend ? delta >= 0 : delta > 0;
      }

      var drawCol = function (trend, prices, key, ctx, X, Y){
        var shadowStyle = function (ctx, offX, offY, blur, color){
          ctx.shadowOffsetX = offX;
          ctx.shadowOffsetY = offY;
          ctx.shadowBlur = blur;
          ctx.shadowColor = color;//rgba(0, 255, 0, 0.5)";
        };

        var drawX = function (ctx, X, Y){
          shadowStyle(ctx, 2, 2, 2, "black");
          drawLine(ctx, makePoint(X - 5, Y - 5), makePoint(X + 5, Y + 5), "green");
          drawLine(ctx, makePoint(X - 5, Y + 5), makePoint(X + 5, Y - 5), "green");
        };

        var drawO = function (ctx, X, Y){
          shadowStyle(ctx, 2, 2, 2, "black");
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.arc(X, Y, 5, 0, 2*Math.PI, false);
          ctx.stroke();
        }

        if (trend) {
          for (var plotIndex = prices[key - 1]; plotIndex <= prices[key]; plotIndex += 1)
            { drawX(ctx, X, Y -= 10); }
        } else {
          for (var plotIndex = prices[key - 1]; plotIndex >= prices[key]; plotIndex -= 1)
            { drawO(ctx, X, Y += 10); }
        }
        return Y;
      }

      // todo Y always starts in the center.  Need to write scale to left properly.
      var X = Math.max(25, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 4) * 5),
          Y = (Math.max(Math.floor(priceRange.high), 30) - Math.floor(prices[0]) + 1) * 10 + 5;
      var trendUp = (prices[1] - prices[0]) >= 0;
      drawAxes(ctx);
      ctx.save();
      // Need to scale Y (prices[i]) according to price range.
      Y = drawCol(trendUp, prices, 1, ctx, X, Y);
      for (var i=2; i < prices.length; i += 1){
        if (trendUp !== detectTrend(trendUp, prices, i)) {
          X += 10;
          trendUp = !trendUp;
        };
        Y = drawCol(trendUp, prices, i, ctx, X, Y);
      };
      ctx.restore();
    }

    console.log("rendered")
    var tickerSymb = $("#tickerInput").val();
    if (StockData.findOne({chart: tickerSymb})) {
      var savedData = StockData.findOne({chart: tickerSymb}).data
      console.log("Hello?" + savedData);
      var svg = d3.select("svg");
      var priceRange = findRange(savedData);
      var chartWidth = 600;
      var chartHeight = Math.max(600, (priceRange.high - priceRange.low) * 10);
      svg
        .attr("height", chartHeight)
        .attr("height", chartWidth);
       // TODO could remove var chartData when not using in console.log
    // debugger
    //   $("#chart").append("<div id='container2'><br><div class='chartTitle'>" + tickerSymb.toUpperCase() + "</div>" +
    //                          "<canvas class='pnfChart' id='2Chart' width='" + chartWidth + "' height='" + chartHeight + "'></canvas></div>");
    //   $("#tickerInput").val("");
    //   var canvas = document.getElementById("2Chart");
    //   var ctx = canvas.getContext("2d");
    //   ctx.beginPath();
    //   ctx.moveTo(20, 0);
    //   ctx.lineTo(600, 6000);
    //   ctx.stroke();


      // /*canvas.getContext &&*/ webkitRequestAnimationFrame(function (){
      //   createChart(canvas.getContext("2d"), savedData, priceRange, chartHeight);
      // });
    }
    // END chart render script
      // var svg = d3.select("svg");
      // svg
      //   .attr("height", 600)
      //   .attr("height", 600);
      // svg
      //   .append("svg:line")
      //   .attr("x1", "20")
      //   .attr("y1", "0")
      //   .attr("x2", "20")
      //   .attr("y2", "500");
      // svg.append("circle")
      //   .attr("cx", "250")
      //   .attr("cy", "250")
      //   .attr("r", "20");
  }

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });

  Template.getChart.events({
    'click button': function (){
      var stockPrices = Meteor.call("loadChart", $("#tickerInput").val());
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
