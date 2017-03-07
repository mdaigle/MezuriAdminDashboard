const bodyParser = require('body-parser');
import cookieParser from 'cookie-parser';

const express = require('express');
const cons = require('consolidate');

import { getJsByName, getToken } from './js/util';

const app = express();
app.engine('html', cons.handlebars);
app.engine('hbs', cons.handlebars);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/html'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.get('/users', async (req, res) => {
    res.render('users/users.hbs', {
        scripts: getJsByName(['manifest', 'microsoftGraphClient', 'users']),
        token: await getToken(req)
    });
});

app.get('/hbs/:page/:item', (req, res) => {
    res.sendFile('/views/' + req.param('page') + '/' + req.param('item'));
});

// We can change this to whatever port
app.listen(3000);
