'use strict';

import graphClient from '@microsoft/microsoft-graph-client';

import h from '../node_modules/handlebars/dist/cjs/handlebars'

h.default.create()

async function users() {
    const client = graphClient.Client.init({
        authProvider: (done) => {
            done(null, token)
        }
    });

    client
        .api('/users')
        .select(['displayName', 'id', 'userPrincipalName'])
        .get((err, res) => {
            console.log(res);
            // users = res;
        });

    console.log(h);
    console.log(h['user-list']);
}

users().then();