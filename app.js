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
    // Decomment this if you push the bot to the git-repo and want to use it online
    appId: "616adb88-3f1e-4be4-83bd-6fa27148af7a", // 616adb88-3f1e-4be4-83bd-6fa27148af7a // process.env.MICROSOFT_APP_ID
    appPassword: "zDXSaZWHFBAu3sp8nVpq1Ok" // zDXSaZWHFBAu3sp8nVpq1Ok // process.env.MICROSOFT_APP_PASSWORD
    /*
    // Decomment this for local testing purposes
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
    */
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
  function (session) {
    session.send("You said something I could not comprehend. Try asking for 'help' if you dont know what to ask this bot.")

  /*function (session) {
      session.dialogData.firstName = {};
      builder.Prompts.text(session, "What is the first name of the person you are looking for?");
  },
  function (session, results, next) {
      if(results.response) {
        session.dialogData.firstName = {};
        console.log("Debug Log is beginning here --------------  ");
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
// Register possible routes here
// The if conditional recognizes keywords in user-inputs, so this is for
// choosing which route to take. Because this chatbot is just a
// a simple prototype there are few routes and only the
// "search" case is important, but its easy to just add more routes
bot.recognizer({
  recognize: function(context, done) {
    var intent = { score: 0.0 };

    if(context.message.text) {

      if((context.message.text.toLowerCase()).indexOf("test") != -1) {
        intent = { score: 1.0, intent : 'Testing'}
      }
      if((context.message.text.toLowerCase()).indexOf("help") != -1) {
        intent = { score: 1.0, intent : 'Help'}
      }
      if((context.message.text.toLowerCase()).indexOf("search for someone") != -1) {
        intent = { score: 1.0, intent : 'Searching'}
      }
      if((context.message.text.toLowerCase()).indexOf("looking for someone") != -1) {
        intent = { score: 1.0, intent : 'Searching'}
      }
      if((context.message.text.toLowerCase()).indexOf("looking for a person") != -1) {
        intent = { score: 1.0, intent : 'Searching'}
      }
      if((context.message.text.toLowerCase()).indexOf("search for a person") != -1) {
        intent = { score: 1.0, intent : 'Searching'}
      }
      /*if((context.message.text.toLowerCase()).indexOf("search") != -1) {
        intent = { score: 1.0, intent : 'InstantSearch'}
      }
      if((context.message.text.toLowerCase()).indexOf("looking for") != -1) {
        intent = { score: 1.0, intent : 'InstantSearch'}
      }*/

    }
    done(null, intent);
  }
});

// This is just for debugging purposes, no other function than that
bot.dialog('testDialog', function(session) {
  session.endDialog("This intent is working correctly. You chose the Testing intent, which was fullfilled with a 1.0 score.");
}).triggerAction({ matches: 'Testing' });

// this is the help dialog, which explains the user how this bot works
bot.dialog('helpDialog', function(session) {
  session.endDialog("TODO: Write the Help Dialog.");
}).triggerAction({ matches: 'Help' });


// We are declaring a global variable for the name of the person we are looking for
var specifiedName = null;

// This is when the user does not put a name with the intent to search for someone
// So the bot prompts the user to state a name, this is also basically the only difference
// to the InstantSearch Dialog
bot.dialog('searchDialog', [
  // We're first asking for the name of the person we want to find
  function(session) {
    session.dialogData.inputName = {};
    builder.Prompts.text(session, "What is the name of the person you are looking for?");
  },
  function (session, results, next) {
      if(results.response) {
        session.dialogData.inputName = {};
        console.log("Debug Log for 'a normal search dialog' is beginning here --------------  ");
        session.dialogData.inputName = results.response;
        // Usually in a normal dialog user input for a name is simply a first and last name so we're splitting the array up
        // That means that name[0] is the first name and name[1] is the last name for the query
        specifiedName = String(session.dialogData.inputName).split(" ");
        console.log("Name variable is: " + specifiedName);
        //specifiedName = String(specifiedName).replace("and", "");
        console.log("Name variable - First Name: " + capitalizeFirstLetter(specifiedName[0]) + " and Last Name: " + capitalizeFirstLetter(specifiedName[1]));
        //console.log("Test: " + String(session.dialogData.firstName));
        //var url = "https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Employee_API?$filter=FIRST_NAME%20eq%20'" + name[0] + "'\n\n\n\n\n\n\n\n";
        var url = "https://test-merckserono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API?$filter=FIRST_NAME%20eq%20'" + capitalizeFirstLetter(specifiedName[0]) + "'%20and%20LAST_NAME%20eq%20'" + capitalizeFirstLetter(specifiedName[1]) + "'\n\n\n\n\n\n\n\n";
        console.log("The URL is: " + url);

        client.get(String(url), function(response) {

            //console.log("Response: " + response);

            var counter = occurrences(String(response), "FIRST_NAME");
            //console.log("counter is " + counter);
            session.send("I found " + counter + " entries with the name " + specifiedName[0] + " " + specifiedName[1] + ".")
            // go into the next dialog
            session.beginDialog("InstantSearch");
        });
      }
    }
]).triggerAction({ matches: 'Searching' });

// This dialog determines which information from the user you want to get (normal card, notes card, map card)
// TODO: This should also fire if the user ignores the normal Search Dialog
bot.dialog("InstantSearch", [
  function(session) {
    builder.Prompts.text(session, "What information do you want to have? \n I can give you **information** about the person, **notes** or a **map**.");
  },
  function(session, results, next) {
    if(results.response) {

      // This conditonal generates a hero card with basic information about the specified person
      if(results.response.toLowerCase().indexOf("information") != -1) {
        var url = "https://test-merckserono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API?$filter=FIRST_NAME%20eq%20'" + capitalizeFirstLetter(specifiedName[0]) + "'%20and%20LAST_NAME%20eq%20'" + capitalizeFirstLetter(specifiedName[1]) + "'\n\n\n\n\n\n\n\n";
        client.get(String(url), function(response) {

            var counter = occurrences(String(response), "FIRST_NAME");

            var responseArr = String(response).split("},{");

            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments([
              createHeroInfoCard(session,responseArr[0]),
              createHeroInfoCard(session,responseArr[1])
            ])
            session.send(msg);
            session.endDialog("Here are your results!");
        });
      }
      // this conditional should look for notes which correlate to the specified person
      if(results.response.toLowerCase().indexOf("notes") != -1) {
        // TODO: Query after individualapi -> then query after individual adress api -> then query after notes (if there is such a thing)
        var url = "https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API?$filter=FIRST_NAME%20eq%20'" + specifiedName[0] + "'%20and%20LAST_NAME%20eq%20'" + specifiedName[1] + "'\n\n\n\n\n\n\n\n";
        session.endDialog("Here should be the note card, but it isn't finished yet, so I will end this Dialog now. :( Sorry for that!");
      }
      // this conditional should generate a link for google maps
      if(results.response.toLowerCase().indexOf("map") != -1) {
        // TODO: Query after individualapi -> then query after individual adress api -> use information to generate google maps link
        var url = "https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API?$filter=FIRST_NAME%20eq%20'" + capitalizeFirstLetter(specifiedName[0]) + "'%20and%20LAST_NAME%20eq%20'" + capitalizeFirstLetter(specifiedName[1]) + "'\n\n\n\n\n\n\n\n";

        var counter;
        var individualIdentifier = [];

        client.get(String(url), function(response) {

            counter = occurrences(String(response), "FIRST_NAME");

            var responseArr = String(response).split("},{");
            for(var i = 0; i < counter; i++) {
              individualIdentifier[i] = getResult("INDIVIDUAL_IDENTIFIER", responseArr[i]);
              console.log("Individiual Identifier No." + i + " is " + individualIdentifier[i]);
            }
            url = "https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Individual_API(" + individualIdentifier[0] + ")/IndividualAddress_API";

            // For testing purposes this only gives out the first entry of the name you searched for
            // as for not pressuring the database too much and we dont need this for prototyping purposes
            // In this step we get the addressIdentifier which we then need to get the specified entry
            // in the adress_api where we can get the actual location we are looking for
            console.log("new url is: " + url);
            var addressIdentifier
            client2.get(String(url), function(response) {
              addressIdentifier = getResult("ADDRESS_IDENTIFIER", response);
              console.log("AdressIdentifier: " + addressIdentifier);

              // Here we are finall looking up the location of the specified person
              // we simply take the street, city and country and put it in a google maps query
              // which is as simple as it gets
              url = "https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Address_API(" + addressIdentifier + ")";
              var street;
              var city;
              var postCode;
              var countryCode;
              client3.get(String(url), function(response) {
                street = getResult("LINE_1_ADDRESS", response);
                city = getResult("VILLAGE_LABEL", response);
                countryCode = getResult("COUNTRY_CODE", response);

                url = "http://maps.google.com/?q=" + street + "," + city + "," + countryCode;
                var msg = new builder.Message(session);
                msg.attachmentLayout(builder.AttachmentLayout.carousel)
                msg.attachments([
                  createHeroMapCard(session,url),
                ])
                session.endDialog(msg);
                });
            });
        });


      }

    }
  }
]).triggerAction({ matches: 'InstantSearch' });

// function to create the hero Cards - containing basic information -> for the "information conditonal"
function createHeroInfoCard(session, response) {
    return new builder.HeroCard(session)
      .title(getResult("FIRST_NAME", response) + " " + getResult("LAST_NAME", response))
      .subtitle('Birthday: ' + getResult("BIRTH_DAY", response) + "-" + getResult("BIRTH_YEAR_NUMBER", response))
      .text('Preferred Language: ' + getResult("LNG_EID_CODE", response) + "\n" + "Likes: " + getResult("LIKES", response) + "\n" + "Dislikes: " + getResult("DISLIKES", response))
      .images([
          //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
        ])
      .buttons([
          builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Link to User-Profile')
        ])
}

// function to create the hero Cards - containing link to google maps -> for the "maps conditional"
function createHeroMapCard(session, url) {
    return new builder.HeroCard(session)
      .title("Maps Card")
      .subtitle(specifiedName[0] + " " + specifiedName[1])
      .text("Click the Link to show the destination in your Maps Application")
      .images([
          //builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
        ])
      .buttons([
          builder.CardAction.openUrl(session, url, 'Link to Google Maps')
        ])
}

// function to capitalize the first letter of a string
// this is important as the MI API only recognizes case-sensitive input
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

// this can possibly be changed to one
// also this is no good programming ;)
var client = new HttpClient();
var client2 = new HttpClient();
var client3 = new HttpClient();
var rep;
/*client.get("https://demo-merck-serono-eu-mi.emea.crm.cegedim.com/MobileIntelligence/v1/Employee_API?$filter=FIRST_NAME%20eq%20'Mark'\n\n\n\n\n\n\n\n", function(response) {
    console.log("Response: " + response);
    //rep = response;
});*/
