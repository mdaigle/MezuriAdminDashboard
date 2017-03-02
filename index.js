var bodyParser = require('body-parser');

var express = require('express');
var app = express();

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
