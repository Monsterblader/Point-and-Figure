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
      // There are five price increments that are established as part of the definition of point and figure charting.  I have separated the processing of each range into (five) functions.
      var axisRange = function (high, low){
        return [range5(high, low), range4(high, low), range3(high, low), range2(high, low), range1(high, low)];
      };
      var range5 = function (high, low){
        return high >= 200 ? Math.floor(high / 4) + 1 - Math.max(Math.floor(low / 4), 50) : 0;
      };
      var range4 = function (high, low){
        return (high < 200) && (high >= 100) ? Math.min(101, Math.floor(high / 2) + 1) - Math.max(Math.floor(low / 2), 50) : 0;
      };
      var range3 = function (high, low){
        return (high < 100) && (high >= 20) ? Math.min(101, Math.floor(high) + 1) - Math.max(Math.floor(low), 20) : 0;
      };
      var range2 = function (high, low){
        return (high < 20) && (high >= 5) ? Math.min(41, Math.floor(high * 2) + 1) - Math.max(Math.floor(low * 2), 10) : 0;
      };
      var range1 = function (high, low){
        return high < 5 ? Math.floor(high * 4) + 1 - Math.floor(low * 4) : 0;
      };
      ctx.font = "12px Times New Roman";
      ctx.fillStyle = "Black";
      var breakPoints = axisRange(priceRange.high, priceRange.low);
      var n = breakPoints[0] + breakPoints[1] + breakPoints[2] + breakPoints[3] + breakPoints[4];
      var paddedHigh;
      if (n < 30) {
        n = Math.floor((30 - n) / 2);
        var splitN;
        if (breakPoints[0]) {
          breakPoints[0] += n;
          paddedHigh = (Math.floor(priceRange.high / 4) + 1 + n) * 4;
          if (Math.floor(priceRange.low / 4) - 50 > n) {
            breakPoints[0] += n;
          } else {
            breakPoints[0] += Math.floor(priceRange.low / 4) - 50;
            splitN = n - (Math.floor(priceRange.low / 4) - 50);
            breakPoints[1] += splitN;
          }
        } else if (breakPoints[1]) {
          if (100 - Math.floor(priceRange.high / 2) > n) {
            breakPoints[1] += n;
            paddedHigh = (Math.floor(priceRange.high / 2) + 1 + n) * 2;
          } else {
            breakPoints[1] += 100 - Math.floor(priceRange.high / 2);
            splitN = n - (100 - Math.floor(priceRange.high / 2));
            breakPoints[0] += splitN
            paddedHigh = 200 + splitN * 4;
          }
          if (Math.floor(priceRange.low / 2) - 50 > n) {
            breakPoints[1] += n;
          } else {
            breakPoints[1] += Math.floor(priceRange.low / 2) - 50;
            splitN = n - (Math.floor(priceRange.low / 2) - 50);
            breakPoints[2] += splitN;
          }
        } else if (breakPoints[2]) {
          if (100 - Math.floor(priceRange.high) > n) {
            breakPoints[2] += n;
            paddedHigh = Math.floor(priceRange.high) + 1 + n;
          } else {
            breakPoints[2] += 100 - Math.floor(priceRange.high) + 1;
            splitN = n - (100 - Math.floor(priceRange.high) + 1);
            breakPoints[1] += splitN;
            paddedHigh = 100 + splitN * 2;
          }
          if (Math.floor(priceRange.low) - 20 > n) {
            breakPoints[2] += n;
          } else {
            breakPoints[2] += Math.floor(priceRange.low) - 20;
            splitN = n - (Math.floor(priceRange.low) - 20);
            breakPoints[3] += splitN;
          }
        } else if (breakPoints[3]) {
          if (40 - Math.floor(priceRange.high / 0.5) > n) {
            breakPoints[3] += n;
            paddedHigh = (Math.floor(priceRange.high / 0.5) + 1 + n) * 0.5;
          } else {
            breakPoints[3] += 40 - Math.floor(priceRange.high / 0.5) + 1;
            splitN = n - (40 - Math.floor(priceRange.high / 0.5) + 1);
            breakPoints[2] += splitN;
            paddedHigh = 20 + splitN * 0.5;
          }
          if (Math.floor(priceRange.low / 0.5) - 10 > n) {
            breakPoints[3] += n;
          } else {
            breakPoints[3] += Math.floor(priceRange.low / 0.5) - 10;
            splitN = n - (Math.floor(priceRange.low) - 10);
            breakPoints[4] += splitN * 0.25;
          }
        } else {
          breakPoints[3] = 10;
          paddedHigh = 10;
          breakPoints[4] = 20;
        }
      } else {
        paddedHigh = Math.floor(priceRange.high);
      }
      var axisIndex = 1;
      if (breakPoints[0]) {
        for (var i = breakPoints[0]; i-- > 0; paddedHigh -= 4) {
          ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
        };
      };
      if (breakPoints[1]) {
        for (var i = breakPoints[1]; i-- > 0; paddedHigh -= 2) {
          ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
        };
      };
      if (breakPoints[2]) {
        for (var i = breakPoints[2]; i-- > 0; paddedHigh -= 1) {
          ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
        };
      };
      if (breakPoints[3]) {
        for (var i = breakPoints[3]; i-- > 0; paddedHigh -= 0.50) {
          ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
        };
      };
      if (breakPoints[4]) {
        for (var i = breakPoints[4]; i-- > 0; paddedHigh -= 0.25) {
          ctx.fillText(paddedHigh, 1, axisIndex++ * 10);
        };
      };
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
