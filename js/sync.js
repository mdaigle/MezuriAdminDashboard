'use strict';

import syncManagerClient from './syncManagerClient.js';

const INSTANCES_COOKIE_KEY = 'syncInstances';

let defaultInstances = JSON.stringify([
    {
        id: 'instance_1',
        name: 'Instance 1',
        link: 'http://demo-sync.mezuricloud.com/'
    },
    {
        id: 'instance_2',
        name: 'Instance 2',
        link: 'http://demo-sync2.mezuricloud.com/'
    }
]);

export async function renderSync(req, res) {
    let client = new syncManagerClient(req, res);

    res.render('sync/sync', {
        instances: client.instances,
        validationPattern: client.validationPattern.source
    });
}

export async function addSyncPost(req, res) {
    // TODO: validation
    // packages added already

    let newInstance = new syncManagerClient(req, res).updateInstances(res, req.body['instanceName']);
    console.log(newInstance);

    res.render('sync/sync-add', newInstance);
}

export async function renderSyncDetail(req, res) {
    res.redirect('/sync');
}

export async function syncDetailPost(req, res) {

}