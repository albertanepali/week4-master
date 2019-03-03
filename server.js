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

//User signup
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {

        res.json({success: false, msg: 'Enter username and password for signup'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser);

        res.json({success: true, msg: 'Congratulations successfully created new user'});
    }
});

//User sign
router.post('/signin', function(req, res) {

    var user = db.findOne(req.body.username);

    if (!user) {

        res.status(401).send({success: false, msg: 'Failed authentication, user not able to find'});
    }
    else {

        if (req.body.password == user.password)  {
            var userToken = { id : user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.UNIQUE_KEY);
            res.json({success: true, token: 'JWT ' + token});
        }
        else {
            //Display an error msg for invalid password
            res.status(401).send({success: false, msg: 'Failed authentication, Invalid password, Try again!!!'});
        }
    };
    router.route('/movies')
        .delete(function (req, res) {
            var user = db.findOne(req.body.username);
            if(!user) {
                //Display msg for not exist user
                res.status(401).send({success: false, msg: "Failed authentication, user not able to find"});
            } else {
                if(req.body.password === user.password){
                    //Display msg for deleted movie
                    res.json({status: 200, message: "Delete movie", headers: req.headers, query: req.query,env: process.env.UNIQUE_KEY});
                }
                else{
                    //Display  msg for invalid password
                    res.status(401).send({success: false, msg: 'Failed authentication, Invalid password, Try again.'});
                }
            }
        });

    router.all('*', function(req, res) {res.json({error: "Invalid HTTP address!, Try valid address"});
    });
});

router.route('/movies')
    .get(function (req, res) {

        //Display msg for movies get from the server
        res.json({status: 200, msg: "Get the movies", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });

router.route('/movies')
    .post(function (req, res) {
        //Display msg for saved movies
        res.json({status: 200, msg: "Saved movie", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });
router.route('/movies')
    .put(authJwtController.isAuthenticated, function(req, res) {

            //Display msg for updated movies
        res.json({status: 200, msg: "Updated movie", headers: req.headers, query: req.query, env: process.env.UNIQUE_KEY});
    });




app.use('/', router);
app.listen(process.env.PORT || 1010);

module.exports = app; // for testing