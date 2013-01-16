Users = new Meteor.Collection("users");
Questions = new Meteor.Collection("questions");
Answers = new Meteor.Collection("answers");

// Users.find({_id: Meteor.userId()}).insert({message: })

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to stackoverflow.";
  };
  Template.hello.username = function (){
    return Session.get("user_name");
  };

  Template.page.set_user = function (){
    return Session.get("user_name");
  };

  Template.questionsarea.events({
    'click .question' : function (){
      $('#answer'+this._id).slideToggle();
      $("#button"+this._id).slideToggle();
    },
    'click button' : function (){
      var answer = {};
      answer.text = $('#answer'+this._id).val();
      answer.time = new Date().getTime();
      answer.questionID = this._id;
      answer.user = Session.get("user_id");
      Answers.insert(answer);
      $(".hide").hide()
    }
  });

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    },
    'click button' : function() {
      var message = {};
      message.text = $('textarea').val();
      message.user = Session.get("user_id");
      message.time = new Date().getTime();
      Questions.insert(message);
      $('textarea').val('');
    }

  });


  Template.nameinput.events({
    'keydown input' : function (e) {
      if (e.which === 13){
        var username = $('input').val();
        console.log(username);
        if (!Users.find({username: username}).count()){
          Users.insert({username: username});
        }
        Session.set("user_id", (Users.findOne({username: username})._id));
        Session.set("user_name", username);
        $('input').val('');
      }
    }
  });

  Template.questionsarea.question = function (){
    var test = Questions.find({}, {sort: {time: -1} } ).map(function(obj, key){
      obj.username = Users.findOne({_id: obj.user}).username;
      obj.answers = Answers.find({questionID: obj._id}).fetch();
      // console.log(obj.answers.fetch());
      return obj;
    });
    console.log(test);
    return test;
  };

  // Template.questionsarea.answer = function (){
  //   return Answers.find({questionID: $('.question').data('id')}, {sort: {time: -1} } ).map(function(obj, key){
  //     // obj.username = Users.findOne({/*_id: obj.user*/}).username;
  //     return obj;
  //   });
  // }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
