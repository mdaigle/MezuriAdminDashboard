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
        let group = await req.graphclient.api('/groups/' + req.params.groupid).get();
        group.members = (await req.graphclient.api('/groups/' + group.id + '/members').get()).value;
        group.allUsers = (await req.graphclient.api('/users/').get()).value;
        res.render('groups/singlegroup.hbs', group);
    } catch (err) {
        console.log(err);
    }
}

export async function addUserToGroup(req, res) {
    let users = await req.graphclient.listUsers("$mail eq " + req.params.email);
    let uid = user.value[0].id;
    await req.graphclient.addMemberToGroup(req.params.groupid, uid);
    res.redirect('/groups/' + req.params.groupid);
}

export async function removeUserFromGroup(req, res) {

}
