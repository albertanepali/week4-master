var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObject(req) {
    var json = {
        headers : "No Headers",
        key: process.env.UNIQUE_KEY,
        body : "No Body"
    };

    if (req.body != null) {
        json.body = req.body;
    }
    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.route('/post')
    .post(authController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObject(req);
            res.json(o);
        }
    );

router.route('/post')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        //res.json({success: false, msg: 'Please pass username and password.'});
        res.json({success: false, msg: 'Enter username and password for signup'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser);
        //res.json({success: true, msg: 'Successful created new user.'});
        res.json({success: true, msg: 'Congratulations successfully created new user'});
    }
});

router.route('/movies')
    .get(function (req, res) {
       // res.json({status: 200, msg: "Getting movies from the server", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
        res.json({status: 200, msg: "Get the movies", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });

router.route('/movies')
    .post(function (req, res) {
       // res.json({status: 200, msg: "Movie has been saved!", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
        res.json({status: 200, msg: "Saved movie", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });
router.route('/movies')
    .put(authJwtController.isAuthenticated, function(req, res) {
        //res.json({status: 200, msg: "Movies Have been updated", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
        res.json({status: 200, msg: "Updated movie", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });

router.post('/signin', function(req, res) {

    var user = db.findOne(req.body.username);

    if (!user) {
       // res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        res.status(401).send({success: false, msg: 'Failed authentication, user not able to find'});
    }
    else {
        // check if password matches
        if (req.body.password == user.password)  {
            var userToken = { id : user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.UNIQUE_KEY);
            res.json({success: true, token: 'JWT ' + token});
        }
        else {
            //res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
            res.status(401).send({success: false, msg: 'Failed authentication, Invalid password, Try again!!!'});
        }
    };
    router.route('/movies')
        .delete(function (req, res) {
            var user = db.findOne(req.body.username);
            if(!user) {
               // res.status(401).send({success: false, msg: "Authentication has failed. User was not found"});
                res.status(401).send({success: false, msg: "Failed authentication, user not able to find"});
            } else {
                if(req.body.password === user.password){
                    res.json({status: 200, message: "Delete movie", headers: req.headers, query: req.query,env: process.env.UNIQUE_KEY});
                }
                else{
                   // res.status(401).send({success: false, msg: 'Authentication failed. Wrong password. Please try agian.'});
                    res.status(401).send({success: false, msg: 'Failed authentication, Invalid password, Try again.'});
                }
            }
        });
   // router.all('*', function(req, res) {res.json({error: "HTTP Address does not exist please try again!"});
    router.all('*', function(req, res) {res.json({error: "Invalid HTTP address!, Try valid address"});
    });
});


app.use('/', router);
app.listen(process.env.PORT || 8080);

module.exports = app; // for testing