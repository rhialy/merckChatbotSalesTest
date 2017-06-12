var restify = require('restify');
var builder = require('botbuilder');
var http = require ('http');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var btoa = require ('btoa');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "616adb88-3f1e-4be4-83bd-6fa27148af7a", // 616adb88-3f1e-4be4-83bd-6fa27148af7a // process.env.MICROSOFT_APP_ID
    appPassword: "zDXSaZWHFBAu3sp8nVpq1Ok" // zDXSaZWHFBAu3sp8nVpq1Ok // process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
  function (session) {
      session.dialogData.firstName = {};
      builder.Prompts.text(session, "What is the first name of the person you are looking for?");
  },
  function (session, results, next) {
      if(results.response) {
        console.log("Debug Log is beginning here --------------");
        session.dialogData.firstName = results.response;
        //console.log("Test: " + String(session.dialogData.firstName));
        var url = "https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Employee_API?$filter=FIRST_NAME%20eq%20'" + session.dialogData.firstName + "'\n\n\n\n\n\n\n\n";
        console.log("The URL is: " + url);
        client.get(String(url), function(response) {

            //console.log("Response: " + response);

            var counter = occurrences(String(response), "FIRST_NAME");
            //console.log("counter is " + counter);

            var responseArr = String(response).split("},{");

            (function() {
              for(i = 0; i < counter; i++) {
                //test = String(response).split("},{")
              }
            })();

            //console.log("test " + test[0]);

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments([
              createHeroCard(session,responseArr[0]),
              createHeroCard(session,responseArr[1])
            ])
            session.send(msg);
        });
      }

      /*if (results.response) {
          session.dialogData.name = results.response;
          builder.Prompts.time(session, "What time would you like to set an alarm for?");
      } else {
          next();
      }*/
  },
  function (session, results) {
      if (results.response) {
          session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
      }

      // Return alarm to caller
      /*if (session.dialogData.name && session.dialogData.time) {
          session.endDialogWithResult({
              response: { name: session.dialogData.name, time: session.dialogData.time }
          });
      } else {
          session.endDialogWithResult({
              resumed: builder.ResumeReason.notCompleted
          });
      }*/
      if(session.dialogData.firstName) {
        session.endDialogWithResult({
          response: { name: session.dialogData.firstName }
        });
      }
  }
]);
    /*session.send("You said: %s", session.message.text);
    session.send(rep);
});*/

// function to create the hero Cards
function createHeroCard(session, response) {
    return new builder.HeroCard(session)
      .title(getResult("FIRST_NAME", response) + " " + getResult("LAST_NAME", response))
      .subtitle('Employee-ID: ' + getResult("CLIENT_EMPLOYEE_IDENTIFIER", response))
      .text('E-Mail-Adress: ' + getResult("EMAIL_ADDRESS", response))
      .images([
          //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
        ])
      .buttons([
          builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Link to User-Profile')
        ])
}

// function to check how many results were given
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

// function to get value of specific property from the json object
function getResult(specifiedString, response) {
  var outputString = String(response).split(specifiedString);
  outputString = String(outputString[1]).split(",");
  outputString = String(outputString[0]).split(":");
  outputString = String(outputString).replace(/\"/g, "");
  outputString = String(outputString).replace(",", "");
  return outputString;
}

// Connection to MI apic
function authenticateUser(user, password)
{
    var token = user + ":" + password;

    // Base64 Encoding -> btoa
    var hash = btoa(token);

    return "Basic " + hash;
}

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }
        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.setRequestHeader("content-type", "application/json");
        anHttpRequest.setRequestHeader("Authorization", "Basic YWRtaW5fcWltc2g6UEA1NXdvcmQyMDE3", "");
        anHttpRequest.responseType = "json";
        anHttpRequest.send( null );
    }
}

var client = new HttpClient();
var rep;
client.get("https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Employee_API?$filter=FIRST_NAME%20eq%20'Mark'\n\n\n\n\n\n\n\n", function(response) {
    console.log("Response: " + response);
    //rep = response;
});

/*client.get('https://test-merckserono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Region_API(47051)/Region_Country_API', function(response) {
    console.log("Response: " + response);
    rep = response;
});
client.get('https://test-merckserono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API(9000000000020127)/IndividualAddress_API', function(response) {
    console.log("Response: " + response);
    //rep = response;
});*/
