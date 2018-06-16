var fs = require('fs');
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
var exphbs = require('express-handlebars');
var HandlebarsIntl = require('handlebars-intl');
var formatter = require('./static/request_formatter');
var domain = process.env.APP_HOST;
const PORT = process.env.PORT || 3000;
const TOKEN =  process.env.token;
var helpers = require('handlebars-helpers')(['math', 'comparison']);
var hbs = exphbs.create({defaultLayout: 'base'});
app.engine(hbs.extname, hbs.engine);
app.set('view engine', hbs.extname);
HandlebarsIntl.registerWith(hbs.handlebars);


app.use('/static',express.static(__dirname + '/static'));
app.set('views','./views');

var botMessages = [];

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
			contentType: "application/json; charset=utf-8",
			headers:
     		{
			'Accept': '*/*',
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + TOKEN }
       	};

  	request(options, function (error, response, body) {
    		if (error){
				  console.log(error);
        }else{
			promise= new Promise (function(resolve, reject){
				resolve(intent = JSON.parse(body));
			}).catch((SyntaxError) => {
			  });;
			promise.then(function(intent){
				res.render('detail',intent);
			});
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
edit_intent = (id, req, res,next)=>{

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
			selected_intent = body;
			intent = JSON.parse(selected_intent);

			res.render('set_intent',intent);
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

delete_entity =(id,req,res)=>{
    var options = {
		method: 'DELETE',
		  url: 'https://api.dialogflow.com/v1/entities/'+id,
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
				'Content-Type': 'application/json; charset=utf-8'
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
	/**
	 * Create a new intent with the random_gif format
	 */
	post_random_gif = (req,res,next)=>{
		var postOptions;
		var nombre = req.body.name;
		var userText = req.body.user;
		var gif_action = req.body.action;

		promise = new Promise((resolve)=>{
			resolve(userFormatted = formatter.format_user_request(userText));
		});

		promise.then((userFormatted) => {
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
				contexts: [],
				events: [],
				fallbackIntent: false,
				name: nombre,
				priority: 500000,
				responses:
				[ { action: gif_action,
					affectedContexts: [],
					defaultResponsePlatforms: { google: true },
					messages:[],
					parameters: [],
					resetContexts: false } ],
				templates: [],
				userSays:
				 userFormatted,
				webhookForSlotFilling: false,
				webhookUsed: true },
				json: true
			};

			request(postOptions, function (error, response, body) {
				if (error) throw new Error(error);
				botMessages = [];
				res.send("/");
				});
			});
	}
	/**
	 * Update a intent
	 */
	put_intent = (req,res,next)=>{
		var postOptions;
		var nombre = req.body.name;
		var userText = req.body.user;
		var botText = req.body.bot;
		var contextIn = req.body.contextIn;
		var contextOut = req.body.contextOut;
		var bot_parameters = req.body.parameters;
		var id = req.body.id;

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
				method: 'PUT',
				url: 'https://api.dialogflow.com/v1/intents/'+id,
				qs: { v: '20150910' },
				headers:
					{
					'Cache-Control': 'no-cache',
					Authorization: 'Bearer ' + TOKEN,
					'Content-Type': 'application/json; charset=utf-8'
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
/**
 *  Insert a new entity
 */
post_entity = (req,res,next)=>{
		let postOptions;
		let name = req.body.name;
		let synonyms = req.body.synonyms;
		let entries = synonyms.map(function(element){
			return {
				synonyms: [element],
				value: element
			  };
		})
		postOptions = {
			method: 'POST',
			url: 'https://api.dialogflow.com/v1/entities',
			qs: { v: '20150910' },
			headers:
				{
				'Cache-Control': 'no-cache',
				Authorization: 'Bearer ' + TOKEN,
				'Content-Type': 'application/json; charset=utf-8'
				},
		  	body:{
				entries: entries,
				name: name
			  },
			json: true
		};

		request(postOptions, function (error, response, body) {
		if (error) throw new Error(error);
		res.send("/entities");
		});
}
/**
 *
 */
put_entity = (req,res,next)=>{

	let postOptions;
	let id = req.body.id;
	let name = req.body.name;
	let synonyms = req.body.synonyms;
	let entries = synonyms.map(function(element){
		return {
			synonyms: [element],
			value: element
		  };
	})
	postOptions = {
		method: 'PUT',
		url: 'https://api.dialogflow.com/v1/entities/'+id,
		qs: { v: '20150910' },
		headers:
			{
			'Cache-Control': 'no-cache',
			Authorization: 'Bearer ' + TOKEN,
			'Content-Type': 'application/json; charset=utf-8'
			},
		  body:{
			entries: entries,
			name: name
		  },
		json: true
	};

	request(postOptions, function (error, response, body) {
	if (error) throw new Error(error);
	res.send("/entities");
	});
}

app.post('/new_entity', function(req, res, next){
	post_entity(req, res);
});
app.post('/edit_entity', function(req, res, next){
	put_entity(req, res);
});
////
app.get('/', get_intents, function(req, res, next){
		res.render('index', intents);
});

app.get('/interaction',function(req,res,next){
	res.render('interaction');
});

app.post('/get_intents', get_intents, function(req, res, next){
	res.send(intents);
});

app.post('/get_entities', get_entities, function(req, res, next){
	res.send(entities);
});

app.post('/show_entities', get_entities, function(req, res, next){
	let names = [];
	names = entities.map(function(el){
		return el.name;
	})
	res.send(names);
});

app.get('/entities', get_entities, function(req,res,next){
	res.render('entities', entities);
});
app.get('/create',function(req,res,next){
	res.render('new_intent');
});
app.get('/create_gif',function(req,res,next){
	res.render('new_gif');
})
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
app.post('/delete_entity', function(req, res, next){
	let id = req.body.id;
	promise = new Promise((resolve)=>{
		resolve(delete_entity(id,req,res));
	}).then(()=>{
		res.send("/entities");
	});
});
app.post('/update',function(req,res,next){
	put_intent(req, res);
});
app.post('/edit', function(req, res,next){
	let id = req.body.id;
	edit_intent(id, req, res,next);
});
app.get('/:id', function(req, res, next){
	let id = req.params.id;
	get_intent(id, req, res);
});

app.post('/new_intent',function(req,res,next){
	post_intent(req,res);
});
app.post('/new_gif_intent',function(req,res,next){
	post_random_gif(req,res);
})
app.post('/search_entity'), get_entities, function(req, res, next){
	let stringSearch = req.body.stringSearch
	entities.forEach(function(value){
		if(value.name.startsWith(stringSearch))
			res.send(value.name);
	});
}

app.listen( PORT , function(){
	console.log('Server listening in port '+ PORT);
});