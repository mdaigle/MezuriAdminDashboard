'use strict';

import graphClient from '@microsoft/microsoft-graph-client';

import { getJsByName } from './util';

export default async function render(req, res) {
    const userFields = ['displayName', 'id', 'userPrincipalName'];
    const groupFields = ['displayName'];

    const client = graphClient.Client.init({
        authProvider: (done) => {
            done(null, req.token)
        }
    });

    const userList = await client
        .api('/users')
        .select(userFields)
        .get();

    const directMemberOf = await Promise.all(userList.value
        .map(async (user) => (Object.assign({
            memberOf: (await client
                .api(`/users/${user.id}/memberOf`)
                .select(groupFields)
                .get()).value
        }, user))));

    console.log(userList.value[0]);
    console.log(directMemberOf[0]);

    res.render('users/users.hbs', {
        // scripts: getJsByName(['manifest']),
        users: directMemberOf
    })
}