

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var exphbs = require('express-handlebars');
var HandlebarsIntl = require('handlebars-intl');
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


var all_intents;
var intents;
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

app.get('/', get_intents, function(req, res, next){
		res.render('index', intents);
});

app.listen( /*proccess.env.PORT || */3000, function(){
	console.log('Server listening');
});