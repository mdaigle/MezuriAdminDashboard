const bodyParser = require('body-parser');
import cookieParser from 'cookie-parser';

const express = require('express');
const cons = require('consolidate');

import { inspect } from 'util';
inspect.defaultOptions = {
    showHidden: false,
    depth: null,
    maxArrayLength: null,
    colors: true
};

process.on('unhandledRejection', r => console.log(r)); // turns on detailed error/warning

import { getToken, getGraphClient } from './js/util';

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

app.use(async (req, res, next) => {
    try {
        req.token = await getToken(req);
        req.graphClient = getGraphClient(req.token);
    } catch (err) {
        console.error(err);
        res.redirect('http://localhost:5000');
    }
    next();
});

import { renderUsers, renderUserProfile, userEditPost,
    renderUserDelete, userDeletePost, renderUserExport, userExportPost } from './js/users';

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.get('/users', renderUsers);
app.get('/users/profile/:id', renderUserProfile);

app.route('/users/edit/:id')
    .get((req, res, next) => {req.edit = true; next();}, renderUserProfile)
    .post(userEditPost);

app.route('/users/delete')
    .get(renderUserDelete)
    .post(userDeletePost);

app.route('/users/delete/:id')
    .get(renderUserDelete);

// TODO:
app.route('/users/export')
    .get(renderUserExport)
    .post(userExportPost);

// We can change this to whatever port
app.listen(3000);
