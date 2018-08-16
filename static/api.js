var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
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
            console.log(body);
            return body;
        }
  	});

}
module.exports = {
    get_intent: get_intent,
    delete_intent: delete_intent,
    delete_entity: delete_entity
}