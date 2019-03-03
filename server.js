var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');
var authController = require('./auth');
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

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
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

router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObject(req);
            res.send(JSON.stringify({status: res.statusCode, msg: "Movie saved", headers: o.headers, query: req.query, host: o.key }));
        }
    );
router.route('/movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if(req.get('Content-Type')){
            console.log("Content-Type: " + req.get('Content-Type'));
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObject(req);
        res.send(JSON.stringify({status: res.statusCode, msg: "Get movie", headers: o.headers, query: req.query, host: o.key }));
    });
router.route('/movies')
    .put(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if(req.get('Content-Type')){
            console.log("Content-Type: " + req.get('Content-Type'));
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObject(req);
        res.send(JSON.stringify({status: res.statusCode, msg: "Movie updated", headers: o.headers, query: req.query, host: o.key }));
    });
router.route('/movies')
    .delete(authController.isAuthenticated, function (req, res) {
        console.log(req.body);
        res = res.status(200);
        if(req.get('Content-Type')){
            console.log("Content-Type: " + req.get('Content-Type'));
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObject(req);
        res.send(JSON.stringify({status: res.statusCode, msg: "Movie deleted", headers: o.headers, query: req.query, host: o.key }));
    });
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please insert your username and password.'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'You have successful created your account.'});

    }
});

router.post('/signin', function(req, res) {

    var user = db.findOne(req.body.username);
    if (!user) {
        if (res.status(401).send({success: false, msg: 'Authentication failed. User not found.'}));
    }
    else {
        // check if password matches
        if (req.body.password == user.password)  {
            var userToken = { id : user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.UNIQUE_KEY);
            res.json({success: true, token: 'JWT ' + token});
        }
    }
    router.all('*', function(res, req){
        req.json({error: 'Does not support the HTTP method'});
    });
});

app.use('/', router);
app.listen(process.env.PORT || 8080);

module.exports = app; // for testing