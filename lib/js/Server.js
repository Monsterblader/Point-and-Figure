if (Meteor.isServer) {
  Meteor.startup(function () {
    if (SectorList.find().count() === 0) {
      var list = {};
      stockList.forEach(function(info){
        if (list[info.Sector]) {
          if (list[info.Sector][info.industry]) {
            // list[info.Sector][info.industry].push({info.tSymb: info.Name});
          } else {
            // list[info.Sector][info.industry] = [{info.tSymb: info.Name}];
          }
        } else {
          var stock = {};
          stock[tSymb] = info.tSymb;
          stock[name] = info.Name;
          var industry = {};
          industry[info.industry] = [stock];
          console.log(industry);
          list[info.Sector] = industry;
        }
      });
      Object.keys(list).forEach(function(value){
        var sector = {};
        sector[value] = list[value];
        SectorList.insert({sector: value, subsector: [list[value]]});
      });
    }
    if (SectorStockList.find().count() === 0) {
      // TODO populate SectorStockList by {sector: ..., stock: ...}
    }
  });
}
