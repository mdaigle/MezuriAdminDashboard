'use strict';

import syncManagerClient from './syncManagerClient.js';

export async function renderGroups(req, res) {
    let groups;
    try {
        groups = await req.graphclient.api('/groups/').get();
    } catch (err) {
        console.log(err);
    }

    let promises = [];

    groups.value.forEach(function(group, i) {
        let path = '/groups/' + group.id + '/members';
        promises[i] = req.graphclient.api(path).get();
    });

    let members = await Promise.all(promises);

    groups.value.forEach(function(group, i) {
        groups.value[i].members = members[i].value;
    });

    let syncInstances = new syncManagerClient(req, res).instances;

    // remove Sync group prefix
    let syncIds = new Set(syncInstances.map(i => i.id));
    groups.value.forEach((group, i) => {
        if (group.displayName.indexOf(' ') > -1) {
            let name = group.displayName.split(' ');

            if (syncIds.has(name[0])) {
                groups.value[i].displayName = name.slice(1).join(' ');
                groups.value[i].syncId = syncInstances.filter(i => i.id === name[0])[0].id;
            }
        }
    });

    res.render('groups/groups', Object.assign(groups, {
        syncInstances: syncInstances
    }));
}

export async function renderSingleGroup(req, res) {
    try {
        let group = await req.graphclient.api('/groups/' + req.params.group_id).get();
        group.group_id = group.id;
        group.members = (await req.graphclient.api('/groups/' + group.id + '/members').get()).value;

        let memberIdSet = new Set(group.members.map(m => m.id));
        group.users = (await req.graphclient.api('/users/').get())
            .value
            .filter(u => !memberIdSet.has(u.id));
        group.groups = (await req.graphclient.api('/groups/').get())
            .value
            .filter(u => !memberIdSet.has(u.id) && u.id !== group.group_id);
        res.render('groups/singlegroup', group);
    } catch (err) {
        console.log(err);
    }
}

export async function addGroup(req, res) {
    try {
        let group_name = req.body.add_group_name;

        if (req.body['add_sync_group'] === 'on' && req.body['sync_id'])
            group_name = `${req.body['sync_id']} ${group_name}`;

        let content = {
          "displayName": group_name,
          "mailEnabled": false, //We don't want a mail group
          "mailNickname": "testMail",
          "securityEnabled": true //Need this set to true to create a security group
        };

        console.log(content);

        let group = await req.graphclient.api('/groups').post(content);
        res.redirect('/groups');
    } catch (err) {
        console.log(err);
    }
}

export async function addUserToGroup(req, res) {
    let uid = req.body.user_id;
    let group_id = req.params.group_id;

    let path: string = '/groups/' + group_id + '/members/$ref';
    let user_uri: string = "https://graph.microsoft.com/v1.0/directoryObjects/" + uid;
    let user_ref = {
        "@odata.id": user_uri
    };

    await req.graphclient.api(path).post(user_ref);
    res.redirect('/groups/' + group_id);
}

export async function removeUserFromGroup(req, res) {
    let user_id = req.params.user_id;
    let group_id = req.params.group_id;

    let path = `/groups/${group_id}/members/${user_id}/$ref`;

    try {
        await req.graphclient.api(path).delete();
    } catch (err) {
        console.error(err);
    }

    res.redirect(`/groups/${group_id}`);
}
