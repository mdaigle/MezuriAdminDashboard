'use strict';

import graphClient from './graphClient';

export default async function render(req, res) {
    let client = await graphClient();

    let users; // array of users

    client
        .api('/users')
        .get((err, res) => {
            console.log(res);
            // users = res;
        });

    res.render('users.hbs', {
        scripts: {

        }
    });
};
