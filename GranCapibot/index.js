/**
* Webhook for Dialogflow V1
* @author Pablo Leon & Nieves Borrero
*/

"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const restService = express();
const GIPHY_TOKEN =  process.env.giphy; // Defined as env var on Heroku

restService.use(
  bodyParser.urlencoded({ extended: true })
);

restService.use(bodyParser.json());

/**
* Webhook connected to Dialogflow through Heroku app
*/
restService.post("/webhook",function(req,res){
	let response;
	let promise;
	let tag = req.body.result.action //We can change the tag to get differents gifs 
 	promise = new Promise(function(resolve){
    	request("https://api.giphy.com/v1/gifs/random?api_key="+GIPHY_TOKEN+"&tag="+tag+"&rating=PG-13",function(err,res,body){
      		resolve(response = JSON.parse(body).data.images.original.url)
    	});
  	});
  	promise.then(function(response){
    	return res.json({
      		messages:[
        	{
          		type : 3,
          		imageUrl : response
        	}
      		],
      		source : "webhook-echo-sample"
	    	},
    
  		);
  	});
});

restService.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
