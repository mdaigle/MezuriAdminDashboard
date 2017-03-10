'use strict';

export async function renderGroups(req, res) {
    let groups = await req.graphclient.listGroups();

    groups.forEach(function(group, i) {
        groups[i].members = await graphclient.listGroupMembers(group.id);
    });

    res.render('groups.hbs', groups);
}

export async function renderSingleGroup(req, res) {
    let group = await req.graphclient.getGroup(req.params.groupid);
    group.members = await graphclient.listGroupMembers(group.id);
    res.render('singlegroup.hbs', group);
}

export async function addUserToGroup(req, res) {
    let users = await req.graphclient.listUsers("$mail eq " + req.params.email);
    let uid = user.value[0].id;
    await req.graphclient.addMemberToGroup(req.params.groupid, uid);
    res.redirect('/groups/' + req.params.groupid);
}
