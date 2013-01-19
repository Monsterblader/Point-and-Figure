if (Meteor.isClient) {
  Template.moreData.financials = function (){
    var symb = Session.get("currChartSymb");
    if(symb){
      var c = ChartHistory.findOne({stock: symb});
      return c || "loading...";
    } else {
      return "No chart selected";
    }
  };
}
