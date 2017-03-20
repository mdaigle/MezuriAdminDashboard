'use strict';

import express from 'express';

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';
import { __express as pug } from 'pug';

import { inspect } from 'util';
inspect.defaultOptions = {
    showHidden: false,
    depth: null,
    maxArrayLength: null,
    colors: true
};

process.on('unhandledRejection', r => console.log(r)); // turns on detailed error/warning

import { getToken, getGraphClient } from './js/util';
import GraphClient from './ts_out/graphclient.js'

import {
    renderUsers,
    renderUserProfile,
    userEditPost,
    renderUserDelete,
    userDeletePost
} from './js/users';
import {
    renderGroups,
    renderSingleGroup,
    addGroup,
    addUserToGroup,
    removeUserFromGroup
} from './js/groups';
import {
    renderSync,
    addSyncPost,
    renderSyncDetail,
    syncDetailPost
} from './js/sync'

const app = express();

app.engine('pug', (path, options, fn) => {
    let globalOptions = {
        pages: [
            {
                name: 'ODK 2 Sync',
                href: '/sync'
            },
            {
                name: 'Jupyter',
                href: '/jupyter'
            },
            {
                name: 'Users',
                href: '/users'
            },
            {
                name: 'Groups',
                href: '/groups'
            }
        ]
    };

    return pug(path, Object.assign({}, globalOptions, options), fn);
});
app.set('view engine', 'pug');
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
        req.graphclient = new GraphClient(req.token);
    } catch (err) {
        console.error(err);
        res.redirect('http://localhost:5000');
    }
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users', renderUsers);
app.get('/users/profile/:id', renderUserProfile);

app.route('/users/edit/:id')
    .get((req, res, next) => {req.edit = true; next();}, renderUserProfile)
    .post(userEditPost);

app.route('/users/delete')
    .get(renderUserDelete)
    .post(userDeletePost);

app.get('/groups', renderGroups);
app.post('/groups', addGroup);
app.get('/groups/:group_id', renderSingleGroup);
app.post('/groups/:group_id/addUser', addUserToGroup);
app.get('/groups/:group_id/removeUser/:user_id', removeUserFromGroup);

app.route('/sync')
    .get(renderSync)
    .post(addSyncPost);

app.route('/sync/detail/:id')
    .get(renderSyncDetail)
    .post(syncDetailPost);

app.get('/jupyter', (req, res) => res.redirect('JUPYTERHUB_URL'));

// We can change this to whatever port
app.listen(3000, () => console.log('Mezuri Admin Dashboard listening on port 3000.'));
