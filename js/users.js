'use strict';

// import { getJsByName } from './util';

export async function renderUsers(req, res) {
    let userFields = ['displayName', 'id', 'userPrincipalName'];
    let groupFields = ['displayName', 'id'];

    let userList;
    try {
        userList = await listUsers(req.graphClient, userFields);
    } catch (err) {
        console.error(err);
    }

    let directMember = directMemberOfUsers(req.graphClient, userList, groupFields);
    let transitiveMember = transitiveMemberOfUsers(req.graphClient, userList, groupFields);
    try {
        let bothMember = await Promise.all([directMember, transitiveMember]);
        directMember = bothMember[0];
        transitiveMember = bothMember[1];
    } catch (err) {
        console.error(err);
    }

    res.render('users/users.hbs', {
        users: userList.map((user) => Object.assign({},
            user,
            { directMemberOf: directMember[user.id] },
            { transitiveMemberOf: transitiveMember[user.id] }
        ))
    });
}

export async function renderUserProfile(req, res) {
    let profileFields = {
        surname: 'Surname',
        givenName: 'Given Name',
        displayName: 'Display Name',
        id: 'User ID',
        userPrincipalName: 'User Principal Name (UPN)',
        userType: 'User Type',
        accountEnabled: 'Account Enabled'
    };

    let profile = req.graphClient
        .api(`/users/${req.params.id}`)
        .select(Object.keys(profileFields))
        .get();

    let profileMap = Object
        .entries(profileFields)
        .map((entry) => ({itemKey: entry[0], itemLabel: entry[1]}));

    res.render('users/user-profile.hbs', Object.assign(await profile, {profileMap: profileMap}, {edit: req.edit}))
}

export async function userEditPost(req, res) {

}

export async function renderUserDelete(req, res) {
    
}

export async function userDeletePost(req, res) {

}

export async function renderUserExport(req, res) {

}

export async function userExportPost(req, res) {

}

async function listUsers(client, fields) {
    let users = await client
        .api('/users')
        .select(fields)
        .top(5)
        .get();

    return users.value;
}

async function directMemberOf(client, user, fields) {
    return await memberOf(client, user, fields, 'direct');
}

async function transitiveMemberOf(client, user, fields) {
    return await memberOf(client, user, fields, 'transitive');
}

async function memberOf(client, user, fields, type) {
    const VALID_TYPES = ['direct', 'transitive'];

    if (VALID_TYPES.every((t) => t !== type)) {
        throw new Error(`type: ${type} is invalid, valid values are ${VALID_TYPES.toString()}`)
    }

    if (!user.hasOwnProperty('id')) {
        throw new Error('user object must contain user id');
    }

    let isDirect = type === 'direct';

    let request = client.api(`/users/${user.id}/${isDirect ? 'memberOf' : 'getMemberGroups'}`);
    // transitive group membership only lists group id, retrieve other fields below
    let memberOf = isDirect ? request.select(fields).get() : request.post({securityEnabledOnly: true});

    if (isDirect) {
        return (await memberOf).value.filter((g) => g['@odata.type'].endsWith('group'));
    }

    let groupDetail = (await memberOf).value
        .map(async (id) => await (client.api(`/groups/${id}`).select(fields).get()));

    return await Promise.all(groupDetail);
}

async function directMemberOfAllUsers(client, fields) {
    return await memberOfAllUsers(client, fields, 'direct');
}

async function transitiveMemberOfAllUsers(client, fields) {
    return await memberOfAllUsers(client, fields, 'transitive');
}

async function directMemberOfUsers(client, users, fields) {
    return await memberOfUsers(client, users, fields, 'direct');
}

async function transitiveMemberOfUsers(client, users, fields) {
    return await memberOfUsers(client, users, fields, 'transitive');
}

async function memberOfAllUsers(client, fields, type) {
    const VALID_TYPES = ['direct', 'transitive'];

    if (VALID_TYPES.every((t) => t !== type)) {
        throw new Error(`type: ${type} is invalid, valid values are ${VALID_TYPES.toString()}`)
    }

    return await memberOfUsers(client, await listUsers(client, ['id']), fields, type);
}

async function memberOfUsers(client, users, fields, type) {
    const VALID_TYPES = ['direct', 'transitive'];

    if (VALID_TYPES.every((t) => t !== type)) {
        throw new Error(`type: ${type} is invalid, valid values are ${VALID_TYPES.toString()}`)
    }

    if (!users.every((u) => u.hasOwnProperty('id'))) {
        throw new Error('every user object must contain user id');
    }

    return (await Promise.all(
        users.map(
            async (user) => ({
                [user.id]: await memberOf(client, user, fields, type)
            })
        )
    )).reduce((prev, curr) => Object.assign(curr, prev), {}); // converts the array into a dict w/ user id as key
}