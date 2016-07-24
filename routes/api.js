var express = require('express');
var apiRoutes = express.Router();
var config  =  require('../config/main');
var jwt = require('jsonwebtoken');

var User = require('../models/users');

apiRoutes.get('/', function (req, res){
	res.json({ message: "Api is working fine"});
});

  apiRoutes.post('/register', function (req, res, next) {
    console.log(req.body);
    if (!req.body.number || !req.body.password) {
      res.json({
        error: true,
        message: 'Please enter an Number and password to register'
      });
    } else {
      var user = new User(req.body);

      // saving to database

      user.save(function (err) {
        if (err) {
          console.log(err);
          return res.json({
            error: true,
            message: err.errors
          });
        }
        res.json({
          error: false,
          message: 'User is successfully registered',
          id: user._id
        });
      });
    }
  });



apiRoutes.post('/authenticate', function (req, res) {
    if (!req.body.number || !req.body.password) {
      return res.json({
        error: true,
        message: 'Invalid Details'
      });
    } else {
      User.findOne({
        number: req.body.number
      }, function (err, user) {
        if (err)
          throw err;
        if (!user) {
          res.json({
            error: true,
            message: 'You are not authorized'
          });
        } else {
          // password checking
          user.comparePassword(req.body.password, function (err, isMatch) {
            if (isMatch && !err) {

              var payload = {
                id: user._id,
                number: user.Number
              };
              //console.log(payload);
              var token = jwt.sign(payload, config.secret, {
                expiresIn: 3600 // in seconds
              });
              //console.log(token);
              res.json({
                error: false,
                message: 'Successfully Authenticated',
                token: token
              });
            } else {
              // password does not match
              res.json({
                error: true,
                message: 'Failed to authenticate'
              });
            }
          });
        }
      });
    }
  });

apiRoutes.post('/addMoney', function(req, res) {
	console.log(req.body);
	if( !req.body.id || !req.body.amount ) {
		return res.json({
			error : true,
			message: "Invalid Request"
		});
	}
	var userId = req.body.id;
	var amount = req.body.amount;
	var tokens = [];
	for (var i = 0; i < amount; i++ ) {
		tokens[i] = jwt.sign({ userId: userId.toString(), value: 1, num : i}, config.secret, {
			expiresIn: 3600
		}).toString();
	}
	i = 0;

	User.findById(userId, function (err, user) {
		if(err) {
				console.log(err);
				return res.json({
					error: true,
					message: "Could not add money"
				});
		}
		tokens.forEach(function(tok){
			user.coins.push(tok);
		});

		user.save(function(err) {
			if(err) {
				console.log(err);
				return res.json({
					error: true,
					message: "Could not add money"
				});
			} else {
				res.json({
					error: false,
					data: user
				});
			}
		});
	});
});

module.exports = apiRoutes;