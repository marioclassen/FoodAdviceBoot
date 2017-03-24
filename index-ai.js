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
    function (session, args, next) {
        //save the args
        session.dialogData.args = args;

        var allergies = session.userData['allergies'];
        if (!allergies) {
            session.beginDialog('/allergies');
        } else {
            next();
        }
    },
    function (session, args, next) {
        args = session.dialogData.args;


        var food = builder.EntityRecognizer.findEntity(args.entities, 'food');
        console.log(food);
        if (food) {
            var food_name = food.entity;

            // to include API Calls
            //var url = "http://api.apixu.com/v1/current.json?key=<Your API Key>&q=" + city_name;
            //request(url,function(error,response,body){
            //    body = JSON.parse(body);
            //    temp = body.current.temp_c;


            // Prompt for title
            //session.send("I will check if you can eat " + food_name);
            session.dialogData.food = food_name;
            next();
        } else {
            builder.Prompts.text(session, 'Which food do you want me to check?');
        }

    },
    function (session, results) {
        var allergies = session.userData['allergies'];
        var food_name = session.dialogData.food;
        if (!food_name) {
            food_name = results.response;
        }
        session.send("I will check if you can eat " + food_name + " with your " + allergies + " allergy.");
    }
]);

intents.matches('RestaurantAdvice', [
    function (session) {
        session.send("I can recommend you the La Taperia at El Nacional");

        builder.Prompts.choice(session, "More information", "MenuCard|Navigation|Rating");
    },

    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {

            var resultString = results.response.entity;

            if(resultString == "MenuCard"){
                session.send("http://www.elnacionalbcn.com/wp-content/uploads/2014/11/CARTA_TAPERIA.pdf");
            } else if (resultString == "Navigation"){
                session.send("https://www.google.com/maps/dir/Current+Location/El+Nacional");
            } else if (resultString == "Rating"){
                session.send("https://www.tripadvisor.co.uk/LocationPhotoDirectLink-g187497-d7175242-i240567832-El_Nacional_Barcelona-Barcelona_Catalonia.htm");
            }

        } else {
            session.endDialog();
        }
    },

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

bot.dialog('/allergies', [
    function (session, args) {
        var allergies = session.userData['allergies'];
        if (!allergies) {
            builder.Prompts.choice(session, "Which allergie do you have?", ['gluten', 'peanut', 'lactose']);
        } else {
            //next();
        }
    },
    function (session, results) {
        var allergies = session.userData['allergies'];
        if (!allergies) {
            session.userData['allergies'] = results.response.entity;
            console.log(results.response.entity);
        }
        session.endDialog();
    }
]);



