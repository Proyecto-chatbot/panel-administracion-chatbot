/**
* @author Nieves Borrero - Pablo León (2018)
* Proyecto Panel de administración de chatbots en Node.js
*/
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
// helpers for handlebars
var helpers = require('handlebars-helpers')(['math', 'comparison']);
var hbs = exphbs.create({defaultLayout: 'base'});
app.engine(hbs.extname, hbs.engine);
app.set('view engine', hbs.extname);
HandlebarsIntl.registerWith(hbs.handlebars);

// Login Functionality
const bcrypt = require('bcrypt');
const PERSIST_SERVICE = require ('./service');
const service = new PERSIST_SERVICE();
service.get_all_users(function(err,object){console.log(object);});
service.get_all_bots(function(err,object){console.log(object);});
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser());
app.use(session({
	cookieName: 'session',
	secret: '1234',
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
	resave: true,
	saveUninitialized:true
}));


/**
 * Force the user to get logged
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function requiresLogin(req, res, next) {
	if (req.session && req.session.user) {
		return next();
	}else{
		res.render('login');
	}
}
/**
* Force the user to choose an agent
*/
function requiresToken(req,res,next){
	if (req.session && req.session.token){
		return next();
	}else{
		promise = new Promise(function(resolve, reject){
			datos = [];
			let bot_list;
			let keys;
			service.get_all_bots(
				function(err, reply) {
					if(reply == null)
						resolve(bot_list = []);
					else{
						keys = Object.keys(reply);
						datos = Object.values(reply);
						data = datos.map(function(element){
							return JSON.parse(element);
						});
						map= keys.map( function(x, i){
							return {"name": x, "token": data[i].token};
						}.bind(this));
						resolve(bot_list = map);
					}

				});
		});

		promise.then(function(bot_list) {
			res.render('select_agent', bot_list);
		  }, function(bot_list){
			res.render('select_agent', bot_list);
		  });
	}
}
//routes defined
app.use('/static',express.static(__dirname + '/static'));
app.set('views','./views');

var botMessages = [];

var all_intents;
var intents;
var selected_intent;
/**
 * Get all the intents of the agent
 */
get_intents = (req, res, next)=>{
	var options = {
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/intents',
    		qs: { v: '20150910' },
    		headers:
     		{
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + req.session.token }
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
/**
 * Get all the entities of the agent
 */
get_entities = (req, res, next)=>{
    var options = {
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/entities',
    		qs: { v: '20150910' },
    		headers:
     		{
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer ' + req.session.token }
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
/**
 * Get a single intent
 */
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
       		Authorization: 'Bearer ' + req.session.token }
       	};

  	request(options, function (error, response, body) {
    		if (error){
				  console.log(error);
        }else{
			promise= new Promise (function(resolve, reject){
				resolve(intent = JSON.parse(body));


			}).catch((SyntaxError) => {
			  });
			promise.then(function(intent){
				if(intent.responses[0].action == "")
					res.render('detail',intent);
				else
					res.render('detail_gif',intent);
			});
        }
  	});

}
/**
 * Remove the selected intent from the agent
 */
delete_intent =(id,req,res)=>{
    var options = {
		method: 'DELETE',
		  url: 'https://api.dialogflow.com/v1/intents/'+id,
		  qs: { v: '20150910' },
		  contentType: "application/json",
		  headers:
		   {
			 'Cache-Control': 'no-cache',
			 Authorization: 'Bearer ' + req.session.token }
		 };
		request(options, function (error, response, body) {
			if (error) throw new Error(error);
  		});
};
/**
* 
*/
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
			Authorization: 'Bearer ' + req.session.token }
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
/**
 * Get a single entity of the agent
 */
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
       		Authorization: 'Bearer ' + req.session.token }
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
 * Remove an entity from the agent
 */
delete_entity =(id,req,res)=>{
    var options = {
		method: 'DELETE',
		  url: 'https://api.dialogflow.com/v1/entities/'+id,
		  qs: { v: '20150910' },
		  contentType: "application/json",
		  headers:
		   {
			 'Cache-Control': 'no-cache',
			 Authorization: 'Bearer ' + req.session.token }
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
		botMessages.push({ "type": "basic_card", "platform": "google", image: { "url": url, "accessibilityText" : "Image description for screen readers" },"lang": "es"});
		botMessages.push({ "type": 3, "platform": "telegram", "imageUrl": url, "lang": "es"}),
		botMessages.push({ "type": 0,"speech": url});
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
	//Not neccesary but it clarify what we are sending
	promise.then((userFormatted) => {
		console.log('--------BOT MESSAGES--------\n');
		botMessages.forEach(function(element){
			console.log(element);
		});
		console.log('--------USER MESSAGES--------\n');
		userFormatted.forEach(function(element){
			console.log(element);
		});

		postOptions = {
			method: 'POST',
			url: 'https://api.dialogflow.com/v1/intents',
			qs: { v: '20150910' },
			headers:
				{
				'Cache-Control': 'no-cache',
				Authorization: 'Bearer ' + req.session.token,
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
		//res.send(postOptions);
		request(postOptions, function (error, response, body) {
			if (error) throw new Error(error);
			botMessages = [];
			res.send('/');
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
			});

			postOptions = {
				method: 'POST',
				url: 'https://api.dialogflow.com/v1/intents',
				qs: { v: '20150910' },
				headers:
					{
					'Cache-Control': 'no-cache',
					Authorization: 'Bearer ' + req.session.token,
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
				res.send('/');
				});
		});
}
	/**
	 * Edit an intent with the 'random gif' format
	 */
	put_random_gif = (req,res,next)=>{
		var postOptions;
		var nombre = req.body.name;
		var userText = req.body.user;
		var gif_action = req.body.action;
		var id = req.body.id;
		promise = new Promise((resolve)=>{
			resolve(userFormatted = formatter.format_user_request(userText));
		});

		promise.then((userFormatted) => {
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
					Authorization: 'Bearer ' + req.session.token,
					'Content-Type': 'application/json; charset=utf-8'
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
					Authorization: 'Bearer ' + req.session.token,
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
		res.send('/');
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
				Authorization: 'Bearer ' + req.session.token,
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
 * Edit the selected entity
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
			Authorization: 'Bearer ' + req.session.token,
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
// Next, express is listening the diferent get/post requests from our panel
app.get('/display',requiresLogin,function(req,res,next){
	let user = {'userlog': req.session.username};
	res.render('display',/* user*/);
})
app.post('/new_entity', function(req, res, next){
	post_entity(req, res);
});
app.post('/edit_entity', function(req, res, next){
	put_entity(req, res);
});
////
app.get('/',requiresLogin, function(req, res, next){
	promise = new Promise(function(resolve, reject){
		datos = [];
		let bot_list;
		let keys;
		let user;
		service.get_all_bots(
			function(err, reply) {
				if(reply == null)
					resolve(bot_list = []);
				else{
					keys = Object.keys(reply);
					datos = Object.values(reply);
					data = datos.map(function(element){
						return JSON.parse(element);
					});
					map= keys.map( function(x, i){
						return {"name": x, "token": data[i].token, /*'userlog': req.session.username*/};
					}.bind(this));
					resolve(bot_list = map);
				}

			});
	});

	promise.then(function(bot_list) {
		res.render('select_agent', bot_list);
	  }, function(bot_list){
		res.render('select_agent', bot_list);
	  });
});

app.get('/intents',requiresLogin, get_intents, requiresToken, function(req,res){
	res.render('index', intents);
});

app.get('/bots', function(req,res){
	promise = new Promise(function(resolve, reject){
		datos = [];
		let bot_list;
		let keys;
		let user;
		service.get_all_bots(
			function(err, reply) {
				if(reply == null)
					resolve(bot_list = []);
				else{
					keys = Object.keys(reply);
					datos = Object.values(reply);
					data = datos.map(function(element){
						return JSON.parse(element);
					});
					map= keys.map( function(x, i){
						if(data[i].token == req.session.token) return {"name": x, "token": data[i].token};
					}.bind(this));
					resolve(bot_list = map);
				}

			});
	});
	promise.then(function(bot_list) {
		res.render('bots', bot_list);
	  }, function(bot_list){
		res.render('bots', bot_list);
	  });
});
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.render('login');
});
app.get('/register',function(req,res,next){
	res.render('register');
})
app.post('/register', function(req, res){
	service.create_user(req.body.data.u, req.body.data.p);
	res.send('ok');
});

app.get('/login',function(req,res,next){
	res.render('login');
});

app.post('/login', function(req,res){
	promise = new Promise(function(resolve, reject){
        let user = req.body.user;
        let password = req.body.password;
        datos = [];
        let respuesta;
        let keys;
		let exist = false;
        service.get_all_users(
            function(err, reply) {
				if(reply == null || reply == undefined)
					reject(respuesta = false)
				else{
					keys = Object.keys(reply);
					datos = Object.values(reply);
					data = datos.map(function(element){
						return JSON.parse(element);
					});
					map = keys.map( function(x, i){
						return {"user": x, "passwd": data[i].password, "valido": data[i].valido };
					}.bind(this));
					map.forEach(function(element) {
						if(element.user == user && element.valido == false){
							exist = true;
							reject(respuesta = false);
						}
						if(element.user == user && element.valido == true){
								exist = true;
								bcrypt.compare(password,element.passwd,function(err,res){
									if(res){
										req.session.logged = true;
										req.session.user = element;
										req.session.username = element.user;
										resolve(respuesta = 'response ok');
									}else{
										reject(respuesta = false);
									}
								});
						}
					});
				}

                setTimeout(function(){
                    if(exist == false){
                        reject(respuesta = false);
                    }
                }, 100);
            });
    });
    promise.then(function(respuesta) {
		res.send(respuesta);
      }, function(respuesta){
          res.send(respuesta);
      });

});

app.get('/add',requiresLogin, function(req, res){
	let user = {"this": {'userlog': req.session.username}};
	res.render('add_agent',/* user*/);
});
app.post('/add',function(req,res,next){
	name = req.body.name;
	token = req.body.token;
	service.create_bot(name,token);
	res.send('/');
});

app.post('/select',function(req,res,next){

		req.session.token = req.body.token;
		res.send('/intents');
});

app.post('/bot',function(req,res,next){
	req.session.token = req.body.token;
	res.send('/bots');
});

app.get('/validate', requiresLogin, function(req,res){
	promise = new Promise(function(resolve, reject){
		let user = req.body.user;
		let password = req.body.password;
		datos = [];
		let users_list;
		let keys;
		let validado;

		service.get_all_users(
			function(err, reply) {
				keys = Object.keys(reply);
				datos = Object.values(reply);
				data = datos.map(function(element){
					return JSON.parse(element);
				});
				map= keys.map( function(x, i){
					return {"user": x, "passwd": data[i].password, "valido": data[i].valido, /*'userlog': req.session.username*/};
				}.bind(this));
				resolve(users_list = map);
			});
	});

	promise.then(function(users_list) {
		res.render('validate', users_list);
	  }, function(users_list){
		res.render('validate', users_list);
	  });

});

app.get('/user', requiresLogin, function(req,res){
	promise = new Promise(function(resolve, reject){
		let user = req.body.user;
		datos = [];
		let users_list;
		let keys;
		let validado;

		service.get_all_users(
			function(err, reply) {
				keys = Object.keys(reply);
				datos = Object.values(reply);
				data = datos.map(function(element){
					return JSON.parse(element);
				});
				map= keys.map( function(x, i){
					if(x == req.session.username) return {"user": x, "passwd": data[i].password, "valido": data[i].valido};
				}.bind(this));
				resolve(users_list = map);
			});
	});

	promise.then(function(users_list) {
		res.render('user', users_list);
	  }, function(users_list){
		res.render('user', users_list);
	  });

});

app.post('/validate', function (req, res, next) {
    let user = req.body.id;
    service.validate_user(user);
    res.send('ok');
});

app.post('/user', function (req, res, next) {
	req.session.username = req.body.user;
	res.send('/user');
});

app.post('/setuser', function (req, res, next) {
	let user = req.body.user;
	let password = req.body.password;
	let valido = req.body.validado;
	service.set_users(user, password, valido);
	res.send('ok');
});

app.post('/deny', function (req, res, next) {
    let user = req.body.id;
   	service.deny_user(user);
    res.send('ok');
});

app.post('/get_intents', get_intents,requiresToken, function(req, res, next){
	res.send(intents);
});

app.post('/get_entities', get_entities,requiresToken, function(req, res, next){
	res.send(entities);
});

app.post('/show_entities', get_entities,requiresToken, function(req, res, next){
	let names = [];
	names = entities.map(function(el){
		return el.name;
	})
	res.send(names);
});

app.get('/entities', requiresLogin,get_entities,requiresToken, function(req,res,next){
	entities_body = {entities, "this" : {"userlog": req.session.username}};
	res.render('entities', entities);
});
app.get('/create',requiresLogin,requiresToken,function(req,res,next){
	let user = {"this": {'userlog': req.session.username}};
	res.render('new_intent', /*user*/);
});
app.get('/create_gif',requiresLogin,requiresToken,function(req,res,next){
	let user = {"this": {'userlog': req.session.username}};
	res.render('new_gif', /*user*/);
});
app.get('/create_entity',requiresLogin,requiresToken,function(req,res,next){
	//let user = {"this": {'userlog': req.session.username}};
	res.render('new_entity',/* user*/);
});
app.get('/entities/:id',requiresLogin,requiresToken, function(req,res,next){
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
app.get('/:id', requiresLogin,requiresToken,function(req, res, next){
	let id = req.params.id;
	get_intent(id, req, res);
});

app.post('/new_intent',function(req,res,next){
	post_intent(req,res);
});
app.post('/new_gif_intent',function(req,res,next){
	post_random_gif(req,res);
})
app.post('/edit_gif_intent',function(req,res,next){
	put_random_gif(req,res);
});
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
