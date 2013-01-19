if (Meteor.isClient) {
  Template.sectorMenu.sectorList = function (){
    return SectorList.find();
  };

  Template.sectorStockMenu.sectorStockList = function (){
    return SectorStockList.find({/*How to get sector name from loop*/});
  };

  Template.trendingMenu.trendList = function (){
    return ChartHistory.find({}, {sort: {popularity: -1}});
  };

  Template.headerInformation.fullname = function (){
    var symb = Session.get("currChartSymb");
    if(symb){
      var c = ChartHistory.findOne({stock: symb});
      return (c && c.name) || "loading...";
    } else {
      return "No chart selected";
    }
  };
}
