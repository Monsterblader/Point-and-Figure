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

// TODO fix bug where YHOO shows 21.5

  var drawAxes = function (ctx, top, bottom, scale){
    var labelAxis = function (ctx, priceRange){
      // There are five price increments that are established as part of the definition of point and figure charting.  I have separated the processing of each range into (five) functions.
      var BREAKPOINTS = [{top: Infinity, bottom: 200, increment: 4},
                         {top: 200, bottom: 100, increment: 2},
                         {top: 100, bottom: 20, increment: 1},
                         {top: 20, bottom: 5, increment: 0.50},
                         {top: 5, bottom: 0, increment: 0.25}];
      var axisTickCount = function (high, low){
        var returnArray = [];
        for (var i = 0; i < 5; i += 1) {
          if ((high < BREAKPOINTS[i].top) && (high >= BREAKPOINTS[i].bottom)) {
            // This determines if the stock's high price exceeds the top boundary.
            var highValue = Math.min(BREAKPOINTS[i].top / BREAKPOINTS[i].increment + 1, Math.floor(high / BREAKPOINTS[i].increment) + 1);
            // This determines if the stock's low price exceeds the bottom boundary.
            var lowValue = Math.max(BREAKPOINTS[i].bottom / BREAKPOINTS[i].increment, Math.floor(low / BREAKPOINTS[i].increment));
            returnArray.push(highValue - lowValue);
          } else {
            returnArray.push(0);
          };
        };
        return returnArray;
      };

      ctx.font = "12px Times New Roman";
      ctx.fillStyle = "Black";
      var totalTicks = axisTickCount(priceRange.high, priceRange.low);
      var n = totalTicks[0] + totalTicks[1] + totalTicks[2] + totalTicks[3] + totalTicks[4];
      var paddedHigh;
      if (n < 30) {
        n = Math.floor((30 - n) / 2);
        var splitN;
        var padHigh = function (index){
          var top = BREAKPOINTS[index].top;
          var increment = BREAKPOINTS[index].increment;
          if (top - Math.floor(priceRange.high / increment) > n) {
            totalTicks[index] += n;
            paddedHigh = (Math.floor(priceRange.high / increment) + 1 + n) * increment;
          } else {
            totalTicks[index] += (top / increment) - Math.floor(priceRange.high / increment);
            splitN = n - ((top / increment) - Math.floor(priceRange.high / increment));
            totalTicks[index - 1] += splitN
            paddedHigh = BREAKPOINTS[index - 1].bottom + splitN * BREAKPOINTS[index - 1].increment;
          }
        };
        var padLow = function (index){
          var bottom = BREAKPOINTS[index].bottom;
          var increment = BREAKPOINTS[index].increment;
          if (Math.floor(priceRange.low / increment) - (bottom / increment) > n) {
            totalTicks[index] += n;
          } else {
            totalTicks[index] += Math.floor(priceRange.low / increment) - (bottom / increment);
            totalTicks[index + 1] += n - (Math.floor(priceRange.low / increment) - (bottom / increment));
          }
        };
        if (totalTicks[0]) {
          totalTicks[0] += n;
          paddedHigh = (Math.floor(priceRange.high / 4) + 1 + n) * 4;
          padLow(0);
        } else if (totalTicks[1]) {
          padHigh(1);
          padLow(1)
        } else if (totalTicks[2]) {
          padHigh(2);
          padLow(2);
        } else if (totalTicks[3]) {
          padHigh(3);
          padLow(3);
        } else {
          totalTicks[3] = 10;
          paddedHigh = 10;
          totalTicks[4] = 20;
        }
      } else {
        paddedHigh = Math.floor(priceRange.high);
      }
      var axisIndex = 1;
      for (var i = 0; i < 5; i += 1) {
        if (totalTicks[i]) {
          for (var j = totalTicks[i]; j-- > 0; paddedHigh -= BREAKPOINTS[i].increment) {
            ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
          };
        };
      }
    }

    // This section taken from http://www.w3schools.com/tags/canvas_fillstyle.asp
    var my_gradient=ctx.createLinearGradient(0, 0, 0, chartHeight / 2);
    my_gradient.addColorStop(0,"gray");
    my_gradient.addColorStop(1,"white");
    ctx.fillStyle=my_gradient;
    ctx.fillRect(0, 0, 300, chartHeight);
    // End section
    ctx.shadowColor = undefined;
    var axisLeftOffset = Math.max(16, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 2) * 5) + 8;
    drawLine(ctx, makePoint(axisLeftOffset, 0), makePoint(axisLeftOffset, chartHeight), "black");
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
    };

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
  var X = Math.max(32, (Math.floor(Math.log(priceRange.high) / Math.LN10) + 4) * 5 + 7),
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
