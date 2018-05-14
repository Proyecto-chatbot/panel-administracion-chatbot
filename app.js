

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

app.get('/', function(req, res,next) {
    res.render('index');
});
var all_intents;
get_intents = ()=>{
    var options = { 
  		method: 'GET',
    		url: 'https://api.dialogflow.com/v1/intents',
    		qs: { v: '20150910' },
    		headers: 
     		{ 
       		'Cache-Control': 'no-cache',
       		Authorization: 'Bearer XXX' } 
       	};

  	request(options, function (error, response, body) {
    		if (error){
          console.log(error);
        }else{
          all_intents = body;
        }
  	});

}

app.get('/create',function(req, res, next){
    get_intents();
    res.send(all_intents);
});

app.listen( /*proccess.env.PORT || */3000, function(){
	console.log('Server listening');
});