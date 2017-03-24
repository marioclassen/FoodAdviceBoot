var builder = require('botbuilder');
var restify = require('restify');
var apiairecognizer = require('api-ai-recognizer');
var request = require('request');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});


//a5800e076e8046399b8f7fe9440dc963
//var connector = new builder.ConsoleConnector().listen();

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

var recognizer = new apiairecognizer('a5800e076e8046399b8f7fe9440dc963');
var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', intents);

intents.matches('smalltalk.greetings', function (session, args) {
    var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    if (fulfillment) {
        var speech = fulfillment.entity;
        session.send(speech);
    } else {
        session.send('Sorry...not sure how to respond to that');
    }
});

intents.matches('CanIEatThis', [
    function (session, args) {
        var food = builder.EntityRecognizer.findEntity(args.entities, 'food');
        if (food) {
            var food_name = food.entity;

            // to include API Calls
            //var url = "http://api.apixu.com/v1/current.json?key=<Your API Key>&q=" + city_name;
            //request(url,function(error,response,body){
            //    body = JSON.parse(body);
            //    temp = body.current.temp_c;

            session.send("I will check if you can eat " + food_name);
        } else {
            builder.Prompts.text(session, 'Which food do you want me to check?');
        }
    },
    function (session, results) {
        session.send("I will check if you can eat " + results.response);
    }
]);

intents.matches('RestaurantAdvice', [
    function (session) {
        session.send("I can recommend you the El Nacional");
    }
]);

//TODO: implement logic to parse all user date
intents.matches('UserProfile', [
    function (session, args) {
        var givenName = builder.EntityRecognizer.findEntity(args.entities, 'givenName');
        if (givenName) {
            var given_name = givenName.entity;

            // to include API Calls
            //var url = "http://api.apixu.com/v1/current.json?key=<Your API Key>&q=" + city_name;
            //request(url,function(error,response,body){
            //    body = JSON.parse(body);
            //    temp = body.current.temp_c;

            session.send("Hello (givenName) " + given_name);
        } else {
            //builder.Prompts.text(session, 'Which food do you want me to check?');
        }
    },
    function (session, results) {
        session.send("I will check if you can eat " + results.response);
    }
]);

intents.onDefault(function (session) {
    session.send("Sorry...can you please rephrase?");
});