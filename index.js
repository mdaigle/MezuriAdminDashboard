var bodyParser = require('body-parser');

var express = require('express');
var cons = require('consolidate');

var app = express();
app.engine('html', cons.handlebars);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

// We can change this to whatever port
app.listen(3000);