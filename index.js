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
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

import { readFileSync } from 'fs';
const scripts = JSON.parse(readFileSync(__dirname + '/webpack-assets.json'));

const getJsFilename = (libs) => {
    return libs.map((k) => scripts[k].js)
};

import renderUsers from './js/users'

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.get('/users', (req, res) => {
    res.render('users/users.hbs', {
       scripts: getJsFilename(['manifest', 'axios', 'microsoftGraphClient'])
    });
});

// We can change this to whatever port
app.listen(3000);
