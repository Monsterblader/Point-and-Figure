if (Meteor.isServer) {
  Meteor.startup(function () {
    if (SectorList.find().count() === 0) {
      var sectorBuildList = {};
      stockList.forEach(function (stockInfo){
        if (sectorBuildList[stockInfo.Sector]){
          if (sectorBuildList[stockInfo.Sector][stockInfo.industry]) {
            sectorBuildList[stockInfo.Sector][stockInfo.industry].push({tSymb: stockInfo.tSymb, name: stockInfo.Name});
          } else {
            sectorBuildList[stockInfo.Sector][stockInfo.industry] = [{tSymb: stockInfo.tSymb, name: stockInfo.Name}];
          }
        } else {
          var stock = {};
          stock.tSymb = stockInfo.tSymb;
          stock.name = stockInfo.Name;
          var industry = {};
          industry[stockInfo.industry] = [stock];
          sectorBuildList[stockInfo.Sector] = industry;
        }
      });

      var list = [];
      Object.keys(sectorBuildList).forEach(function (sector) {
        var sectorObj = {};
        sectorObj.sector = sector;
        sectorObj.industry = [];
        Object.keys(sectorBuildList[sector]).forEach(function (subSector) {
          var industryObj = {};
          industryObj.industry = subSector;
          industryObj.stocks = sectorBuildList[sector][subSector];
          sectorObj.industry.push(industryObj);
        });
        list.push(sectorObj);
      });
      list.forEach(function (value){
        SectorList.insert({sector: value.sector, subsector: value.industry});
      });
    }
    if (SectorStockList.find().count() === 0) {
      // TODO populate SectorStockList by {sector: ..., stock: ...}
    }
  });
}
