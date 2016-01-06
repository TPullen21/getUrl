Urls = new Mongo.Collection("urls");
 
if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("urls", function (key) {
    return Urls.find({
      $or: [
        { key: key }
      ]
    });
  });
}
 
if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("urls", Session.get("keyToGetUrl"));

  Template.body.helpers({
    urls: function () {
        return Urls.find({}, {sort: {createdAt: -1}});
    },
    keyForUrl: function () {
      return Session.get("keyForUrl");
    },
    urlForKey: function () {
      return Session.get("urlForKey");
    },
    generateKey: function () {
      var text = Math.random().toString(10).substr(2, 3);
      var possible = "abcdefghijklmnopqrstuvwxyz";

      for( var i=0; i < 3; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    }
  });

  Template.body.events({
    "submit #getKey": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      console.log("getting key");
 
      // Get values from form element
      var url = event.target.urlInput.value;


      var key = Math.random().toString(10).substr(2, 3);
      var possible = "abcdefghijklmnopqrstuvwxyz";

      for( var i=0; i < 3; i++ )
        key += possible.charAt(Math.floor(Math.random() * possible.length));
 
      // Insert a url into the collection
      Meteor.call("addUrl", url, key);

      return Session.set("keyForUrl", key);
    },
    "submit #getUrl": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      console.log("getting url");
 
      // Get values from form element
      var key = event.target.keyInput.value;

      Session.set("keyToGetUrl", key);

      console.log(Session.get("keyToGetUrl"));
      Meteor.subscribe("urls", Session.get("keyToGetUrl"));
    },
    "click .urlPreview": function (event) {
      Session.set("currentUrlText", this.text);
      Session.set("currentUrlTitle", this.title);
      Session.set("currentUrlId", this._id);
    },
    "click #delete": function () {
      console.log("Deleting");
      Meteor.call("deleteUrl", Session.get("currentUrlId"));
    },
    "keyup #keyInput": function (event) {
      console.log("Input changed");
    }
  });

  Template.registerHelper('validateUrl', function(url) {

    if (url) {
      var validatedUrl = url;

      if (url.indexOf("http://") < 0 || url.indexOf("https://") < 0) {
        var validatedUrl = "http://" + url;
      }

      return new Spacebars.SafeString(validatedUrl)
    }
  });
 
  Template.url.events({
    "click .delete": function () {
      console.log("Deleting");
      Meteor.call("deleteUrl", this._id);
    }
  });
}
 
Meteor.methods({
  addUrl: function (url, key) {
 
    Urls.insert({
      key: key,
      url: url,
      createdAt: new Date()
    });
  },
  deleteUrl: function (urlId) {
    var url = Urls.findOne(urlId);

    Urls.remove(urlId);
  }
});