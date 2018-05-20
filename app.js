var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var exphbs = require('express-handlebars');
var HandlebarsIntl = require('handlebars-intl');

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

var config = require("./config.json");
const TOKEN = config.config[0].token;


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
 * Parse the text into valid JSON for body request
*/
format_user_request = (userText)=>{
	if(typeof userText == 'string'){
		return { data: [ { text: userText } ] } ;
	}else{
		return typeof userText;
	}
}

post_intent = (req,res,next)=>{
	var postOptions;
	var nombre = req.body.name;
	var userText = req.body.user;
	promise = new Promise((resolve)=>{	
		resolve(userFormatted = format_user_request(userText));
	});

	promise.then((userFormatted) => {
		postOptions = {
			method: 'POST',
			url: 'https://api.dialogflow.com/v1/intents',
			qs: { v: '20150910' },
			headers:
				{
				'Cache-Control': 'no-cache',
				Authorization: 'Bearer 806adc1749d543659edcb103d0f2fb01',
				'Content-Type': 'application/json'
				},
		  body:{
			contexts: [],
			events: [],
			fallbackIntent: false,
			name: nombre,
			priority: 500000,
			responses:
			[ { action: '',
				affectedContexts: [],
				defaultResponsePlatforms: { google: true },
				messages: 
				[ { platform: 'google',
					textToSpeech: 'Okay. just created',
					type: 'simple_response'
				},
				{
					platform: 'telegram',
					speech: 'this is in telegram',
					type: 0
				},
				{
					speech: 'Okay this is fine',
					type: 0
				}
			],
				parameters: [],
				resetContexts: false } ],
			templates: [],
			userSays:
			[ userFormatted],
			webhookForSlotFilling: false,
			webhookUsed: false },
			json: true
		};
	
		request(postOptions, function (error, response, body) {
		if (error) throw new Error(error);
		res.redirect("/");
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
app.get('/entities/:id', function(req,res,next){
	let id = req.params.id;
	get_entity(id, req, res);
});

app.get('/:id', function(req, res, next){
	let id = req.params.id;
	get_intent(id, req, res);
});

app.post('/new_intent',function(req,res,next){
	post_intent(req,res);
});


app.listen( /*proccess.env.PORT || */3000, function(){
	console.log('Server listening');
});