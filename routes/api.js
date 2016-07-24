var express = require('express');
var apiRoutes = express.Router();
var  config  =  require('../config/main');
var jwt = require('jsonwebtoken');

var User = require('../models/users');

apiRoutes.get('/', function (req, res) {
  res.json({
    message: "Api is working fine"
  });
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
            
            res.json({
              error: false,
              message: 'Successfully Authenticated',
              id: user._id,
              number: user.Number
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

apiRoutes.post('/addMoney', function (req, res) {
  console.log(req.body);
  if (!req.body.id || !req.body.amount) {
    return res.json({
      error: true,
      message: "Invalid Request"
    });
  }
  var userId = req.body.id;
  var amount = req.body.amount;
  var tokens = [];
  for (var i = 0; i < amount; i++) {
    tokens[i] = jwt.sign({
        userId: userId.toString(),
        value: 1,
        num: i
      }, config.secret, {
        expiresIn: 3600
      })
      .toString();
  }
  i = 0;

  User.findById(userId, function (err, user) {
    if (err) {
      console.log(err);
      return res.json({
        error: true,
        message: "Could not add money"
      });
    }
    tokens.forEach(function (tok) {
      user.coins.push(tok);
    });

    user.save(function (err) {
      if (err) {
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

apiRoutes.get('/checkbalance/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    if (err) {
      return res.json({
        error: true,
        message: "Could not find user"
      });
    } else {
      console.log(user);
      res.json({
        balance: user.coins.length
      });
    }
  });
});

 apiRoutes.post('/transfer', function(req, res){
 	var senderId = req.body.senderId;
    var recpId = req.body.recpId;
    var coins = req.body.coins;
    User.findById(senderId, function (err, user) {
    if (err) {
        return res.json({
            error: true,
            message: "Could not find the user"
          });
       } else {
       	  var ctn = 0;
       	  console.log(coins);
       	  console.log(user.coins);
          for (var i = 0; i < coins.length; i++) {
            for (var j = 0; j < user.coins.length; j++) {
              if (coins[i] == user.coins[j])
                ctn++;
            }
          }

          console.log(ctn);
          console.log(coins.length);

           if (ctn != coins.length) 
          	return res.json({error: true, message: "Invalid money"});

           coins.forEach(function (coin) {
              user.coins.pull(coin);
              user.save(function (err) {
                if (err)
                  console.log(err)
              });
            });


          User.findById(recpId, function (err, user) {
            if (err) {
              console.log(err);
              return res.json({
                error: true,
                message: "Could not add money"
              });
            }

            coins.forEach(function (tok) {
              user.coins.push(tok);
            });

            user.save(function (err) {
              if (err) {
                console.log(err);
                return res.json({
                  error: true,
                  message: "Could not add money"
                });
              } else {
                res.json({
                  error: false,
                  message: "Transaction was successful"
                });
              }
            });
        });
       }
    });
 });

module.exports = apiRoutes;
