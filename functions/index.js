var functions = require('firebase-functions');
var admin = require('firebase-admin');
var request = require('request');
admin.initializeApp(functions.config().firebase);

exports.recievedNewSubscriber = functions.firestore.document('mailchimp-emails/{pushId}').onCreate(function (event) {
  var newValue = event.data.data();
  var email = newValue.email;
  return request.post('https://us4.api.mailchimp.com/3.0/lists/' + functions.config().mailchimpIdEarlySubscribeList + '/members', {
    'auth': {
      'user': 'anystring',
      'password': +functions.config().mailchimpApiKey
    },
    'json': {
      "email_address": email,
      "status": "subscribed"
    }
  });
});
