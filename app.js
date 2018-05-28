var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var exphbs = require('express-handlebars');
var HandlebarsIntl = require('handlebars-intl');
var formatter = require('./static/request_formatter');
var domain = process.env.APP_HOST;
const PORT = process.env.PORT || 3000;
const TOKEN =  process.env.token;

var helpers = require('handlebars-helpers')(['math', 'comparison']);

var app = express();
var hbs = exphbs.create({defaultLayout: 'base'});
app.engine(hbs.extname, hbs.engine);
app.set('view engine', hbs.extname);
HandlebarsIntl.registerWith(hbs.handlebars);


app.use('/static',express.static(__dirname + '/static'));
app.set('views','./views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

var botMessages = [];

/// TODO refactorizar todas las peticiones a un mismo método en una clase
var all_intents;
var intents;
var selected_intent;
get_intents = (req, res, next)=>{
    var options = {
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/intents',
    		qs: { v: '20150910' },
    		headers:
     		{
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + TOKEN }
       	};

  	request(options, function (error, response, body) {
    		if (error){
          console.log(error);
        }else{
		  all_intents = body;
		  intents = Object.values(JSON.parse(all_intents));
		  return next();
        }
  	});

}

var all_entities;
var entities;
var selected_entity;

get_entities = (req, res, next)=>{
    var options = {
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/entities',
    		qs: { v: '20150910' },
    		headers:
     		{
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + TOKEN }
       	};

  	request(options, function (error, response, body) {
    		if (error){
          console.log(error);
        }else{
		  all_entities = body;
		  entities = Object.values(JSON.parse(all_entities));
		  return next();
        }
  	});
}

get_intent = (id, req, res)=>{
    var options = {
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/intents/'+id,
			qs: { v: '20150910' },
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			headers:
     		{
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + TOKEN }
       	};

  	request(options, function (error, response, body) {
    		if (error){
          		console.log(error);
        }else{
			console.log(response);
			  selected_intent = body;
			  intent = JSON.parse(selected_intent);
			//  console.log(intent.responses[0].messages[0].speech);
			  res.render('detail', intent);
        }
  	});

}
delete_intent =(id,req,res)=>{
    var options = {
		method: 'DELETE',
		  url: 'https://api.dialogflow.com/v1/intents/'+id,
		  qs: { v: '20150910' },
		  contentType: "application/json",
		  headers:
		   {
			 'Cache-Control': 'no-cache',
			 Authorization: 'Bearer ' + TOKEN }
		 };
		request(options, function (error, response, body) {
			if (error) throw new Error(error);
  		});
};
get_entity = (id, req, res)=>{
    var options = {
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/entities/'+id,
			qs: { v: '20150910'},
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			headers:
     		{
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + TOKEN }
       	};

  	request(options, function (error, response, body) {
    		if (error){
          		console.log(error);
        }else{
			  selected_entity = body;
			  entity = JSON.parse(selected_entity);
			  res.render('entity', entity);
        }
  	});
}

/**
 * Add a text message
 */
format_bot_response = (botText)=>{
	if(typeof botText == 'string'){
		botMessages.push({ platform: 'google', textToSpeech: botText ,type: 'simple_response'}),
		botMessages.push({ platform: 'telegram', speech: botText, type: 0}),
		botMessages.push({ speech: botText , type: 0 })

	}else{
		let googleResponse = botText.map(function(element){
			return { textToSpeech: element }
		});
		botMessages.push({ platform: 'google', items: googleResponse ,type: 'simple_response'}),
		botMessages.push({ platform: 'telegram', speech: botText, type: 0}),
		botMessages.push({ speech: botText , type: 0 });
	}
}
/**
 * Add a gif/image message
 */
format_bot_image =(url)=>{
		botMessages.push({ "type": "basic_card", "platform": "google", "image": { "url": url },"lang": "es"}),
		botMessages.push({ "type": 3, "platform": "telegram", "imageUrl": url, "lang": "es"}),
		botMessages.push({ "type": 0,"speech": url})

}
/**
 * Add a link/document message
 */
format_bot_link = (url,nombre)=>{
	let markdown = "["+nombre+"]("+url+")";
	botMessages.push({"type": "link_out_chip", "platform": "google","destinationName": nombre,"url": url,"lang": "es" }),
	botMessages.push({"type": 4,"platform": "telegram","payload": { "telegram":
	{ "text": markdown,"parse_mode": "Markdown"  }},"lang": "es" }),
	botMessages.push({"type": 0,"speech": url});
}
/**
 *  Insert a new intent
 */
post_intent = (req,res,next)=>{
	var postOptions;
	var nombre = req.body.name;
	var userText = req.body.user;
	var botText = req.body.bot;
	var contextIn = req.body.contextIn;
	var contextOut = req.body.contextOut;
	var bot_parameters = req.body.parameters;
	console.log(req.body);

	var botFormatted;
	promise = new Promise((resolve)=>{
		botText.forEach(function(element){
				switch(element.type){
					case 'text':
					format_bot_response(element.text); break;
					case 'image':
					format_bot_image(element.text); break;
					case 'link':
					format_bot_link(element.url, element.text); break;
				}
			});
		resolve(userFormatted = formatter.format_user_request(userText));
	});

	promise.then((userFormatted) => {
		console.log('--------BOT MESSAGES--------\n');
		botMessages.forEach(function(element){
			console.log(element);
		});
		console.log('--------USER MESSAGES--------\n');
		userFormatted.forEach(function(element){
			console.log(element);
		})

		postOptions = {
			method: 'POST',
			url: 'https://api.dialogflow.com/v1/intents',
			qs: { v: '20150910' },
			headers:
				{
				'Cache-Control': 'no-cache',
				Authorization: 'Bearer ' + TOKEN,
				'Content-Type': 'application/json'
				},
		  body:{
			contexts: [contextIn],
			events: [],
			fallbackIntent: false,
			name: nombre,
			priority: 500000,
			responses:
			[ { action: '',
				affectedContexts: [{
					"lifespan" : 5,
					"name": contextOut,
					"parameters": {}
				}],
				defaultResponsePlatforms: { google: true },
				messages:botMessages,
				parameters: [bot_parameters],
				resetContexts: false } ],
			templates: [],
			userSays:
			 userFormatted,
			webhookForSlotFilling: false,
			webhookUsed: false },
			json: true
		};

		request(postOptions, function (error, response, body) {
		if (error) throw new Error(error);
		botMessages = [];
		res.send("/");
		});
	});


}
////
app.get('/', get_intents, function(req, res, next){
		res.render('index', intents);
});

app.get('/interaction',function(req,res,next){
	res.render('interaction');
});

app.get('/entities', get_entities, function(req,res,next){
	res.render('entities', entities);
});
app.get('/create',function(req,res,next){
	res.render('new_intent');
});
app.get('/create_entity',function(req,res,next){
	res.render('new_entity');
});
app.get('/entities/:id', function(req,res,next){
	let id = req.params.id;
	get_entity(id, req, res);
});
app.post('/delete',function(req,res,next){
	let id = req.body.id;
	promise = new Promise((resolve)=>{
		resolve(delete_intent(id,req,res));
	}).then(()=>{
		res.send("/");
	});
});
app.get('/:id', function(req, res, next){
	let id = req.params.id;
	get_intent(id, req, res);
});

app.post('/new_intent',function(req,res,next){
	post_intent(req,res);
});

app.listen( PORT , function(){
	console.log('Server listening in port '+ PORT);
});