var express = require('express');
var router = express.Router();
var request = require('request');

var headers = { 'X-Api-Key': 'ad5ecdea7f42d4cec1c40645dc7592bb', 'X-Auth-Token': '722fd22484a359c9a31d5f1c29139300'}

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/add/:id', function(req, res) {
	res.render('form', {id: req.params.id});
});


router.post('/process', function(req, res){
	console.log(req.body);
});

router.get('/redirect', function (req, res){
	var payment_request_id = req.query.payment_request_id;
	var payment_id = req.query.payment_id;
	request.get('https://www.instamojo.com/api/1.1/payment-requests/'+payment_request_id+'/', {headers: headers}, function(error, response, body){
	  if(!error && response.statusCode == 200){
	    console.log(body);
	  }
	});

	request.get('https://www.instamojo.com/api/1.1/payment-requests/'+payment_request_id+'/'+payment_id, {headers: headers}, function(error, response, body){
	  if(!error && response.statusCode == 200){
	    console.log(body);
	  }
	});
});

router.post('/add', function (req, res){

	var amount = req.body.amount;
	var purpose = req.body.purpose;
	var payload = {
  purpose: purpose,
  amount: amount,
  redirect_url: 'http://localhost:3000/redirect/',
  send_email: true,
  webhook: 'http://localhost:3000/process/'
};

console.log(payload);

request.post('https://www.instamojo.com/api/1.1/payment-requests/',
	{form: payload,  headers: headers}, 
	function(error, response, body){
    console.log(body);
    res.redirect(body.payment_request.longurl);
});
});



module.exports = router;
