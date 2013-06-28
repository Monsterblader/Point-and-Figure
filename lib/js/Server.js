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
}
