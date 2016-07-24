var express = require('express');
var router = express.Router();
var request = require('request');

var headers = { 'X-Api-Key': 'ad5ecdea7f42d4cec1c40645dc7592bb', 'X-Auth-Token': '722fd22484a359c9a31d5f1c29139300'}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/add/:id', function(req, res) {
	
	res.render('form', {id: 'binayak@bufo.co.in'});
});


router.post('/process', function(req, res){
	var d = JSON.parse(req.body);
	res.redirect(d.payment_request.longurl);
});

router.get('/redirect', function (req, res){
	var payment_request_id = req.query.payment_request_id;
	var payment_id = req.query.payment_id;
	request.get('https://www.instamojo.com/api/1.1/payment-requests/'+payment_request_id+'/', {headers: headers}, function(error, response, body){
	  if(error){
	    return res.json(error);
	  }
	  
	  var d = JSON.parse(body);
	  res.redirect(d.payment_request.longurl);
	  
	  if(body.payment_request.status == "Completed") {
	  	request.post('http://52.175.36.115:3000/addMoney',{form: {id: body.payment_request.purpose, amount: body.payment_request.amount}},
	  		function(error, response, body){
    v	   var d = JSON.parse(body);
	  res.redirect(d.payment_request.longurl);
    res.end("Done");
});
	  }
	});

	request.get('https://www.instamojo.com/api/1.1/payment-requests/'+payment_request_id+'/'+payment_id, {headers: headers}, function(error, response, body){
	  if(error){
	  	res.json(error);
	  }
	   var d = JSON.parse(body);
	  res.redirect(d.payment_request.longurl);
	});
});

router.post('/add', function (req, res){
	var amount = req.body.amount;
	var purpose = req.body.purpose;
	var payload = {
  	purpose: purpose,
  	amount: amount,
  	webhook: 'http://52.175.36.115:3000/process',
  	redirect_url: 'http://52.175.36.115:3000/redirect'
  	};

console.log(payload);

request.post('https://www.instamojo.com/api/1.1/payment-requests/',
	{form: payload,  headers: headers}, 
	function(error, response, body){
    body = JSON.parse(body);
    var d = JSON.parse(body);
	  res.redirect(d.payment_request.longurl);
	});
});

module.exports = router;
