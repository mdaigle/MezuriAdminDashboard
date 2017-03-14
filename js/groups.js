'use strict';

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

    res.render('groups/groups.hbs', groups);
}

export async function renderSingleGroup(req, res) {
    try {
        let group = await req.graphclient.api('/groups/' + req.params.group_id).get();
        group.group_id = group.id;
        group.members = (await req.graphclient.api('/groups/' + group.id + '/members').get()).value;
        group.allUsers = (await req.graphclient.api('/users/').get()).value;
        res.render('groups/singlegroup.hbs', group);
    } catch (err) {
        console.log(err);
    }
}

export async function addGroup(req, res) {
    try {
        let group_name = req.body.add_group_name;

        let content = {
          "displayName": group_name,
          "mailEnabled": false, //We don't want a mail group
          "mailNickname": "testMail",
          "securityEnabled": true //Need this set to true to create a security group
        }

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

    let user_uri = "https://graph.microsoft.com/v1.0/directoryObjects/" + user_id;
    let user_ref = {
        "@odata.id": user_uri
    };

    let path = '/groups/' + group_id + '/members/$ref';

    let api = req.graphclient.api(path);
    console.log(api);
    //.body(user_ref).delete();
    res.redirect('/groups/' + group_id);
}
