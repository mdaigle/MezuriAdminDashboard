'use strict';

import graphClient from '@microsoft/microsoft-graph-client';

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
}

users().then();