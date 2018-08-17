var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

var base_url = 'https://api.dialogflow.com/v1';
/**
 * Remove the selected intent from the agent
 */
delete_intent =(id,req,res)=>{
    var options = {
		method: 'DELETE',
		url: base_url + '/intents/' +id,
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
 * Remove an entity from the agent
 */
delete_entity =(id,req,res)=>{
    var options = {
		method: 'DELETE',
		url: base_url + '/entities/' +id,
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

get_intents = (req, res, next)=>{

}
module.exports = {
	get_intents: get_intents,
    delete_intent: delete_intent,
    delete_entity: delete_entity
}