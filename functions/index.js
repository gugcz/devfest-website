var functions = require('firebase-functions');
var admin = require('firebase-admin');
var request = require('request');
admin.initializeApp(functions.config().firebase);

exports.recievedNewSubscriber = functions.firestore.document('mailchimp-emails/{pushId}').onCreate(function (event) {
  var newValue = event.data.data();
  var email = newValue.email;
  return request.post('https://us4.api.mailchimp.com/3.0/lists/3a27fbd474/members', {
    'auth': {
      'user': 'anystring',
      'password': 'f02dc0c3e149f6005d6d31e252c0e535-us4'
    },
    'json': {
      "email_address": email,
      "status": "subscribed"
    }
  });
});
