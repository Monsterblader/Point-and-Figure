var increment;
// switch (priceRange.high) {
//   case priceRange.high > 200:
//     increment = 4;
//     break;
//   case priceRange.high > 100:
//     increment = 2;
//     break;
//   case priceRange.high > 20:
//     increment = 1;
//     break;
//   case priceRange.high > 5:
//     increment = 0.5;
//     break;
//   default:
//     increment = 0.25;
//     break;
// };

var axisRange = function (high, low){
  return [range5(high, low), range4(high, low), range3(high, low), range2(high, low), range1(high, low)];
};

var range5 = function (high, low){
  return high >= 200
       ? Math.floor(high / 4) + 1 - Math.max(Math.floor(low / 4), 50)
       : 0;
};

var range4 = function (high, low){
  return (high < 200) && (high >= 100)
       ? Math.min(101, Math.floor(high / 2) + 1) - Math.max(Math.floor(low / 2), 50)
       : 0;
};

var range3 = function (high, low){
  return (high < 100) && (high >= 20)
       ? Math.min(101, Math.floor(high) + 1) - Math.max(Math.floor(low), 20)
       : 0;
};

var range2 = function (high, low){
  return (high < 20) && (high >= 5)
       ? Math.min(41, Math.floor(high * 2) + 1) - Math.max(Math.floor(low * 2), 10)
       : 0;
};

var range1 = function (high, low){
  // Or should I change this one to +1 only?
  return high < 5
        ? Math.floor(high * 4) + 1 - Math.floor(low * 4)
       : 0;
};
