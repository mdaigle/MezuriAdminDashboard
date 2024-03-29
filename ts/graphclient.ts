const msgraph = require("@microsoft/microsoft-graph-client");
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"

module.exports = GraphClient;

function GraphClient(accessToken: string) {
    return msgraph.Client.init({
        authProvider: (done) => {
            done(null, accessToken); //first parameter takes an error if you can't get an access token
        }
    });
}

GraphClient.prototype.createSecurityGroup = async function(group_name: string) {
    var content = {
      "displayName": group_name,
      "mailEnabled": false, //We don't want a mail group
      "mailNickname": "testMail",
      "securityEnabled": true //Need this set to true to create a security group
    }

    return this.api('/groups').post(content);
}

GraphClient.prototype.createSecuritySubgroup = async function(parent_group_id: string, child_group_name: string) {
    this.createSecurityGroup(child_group_name, function(group_info: MicrosoftGraph.Group) {
        this.addMemberToGroup(parent_group_id, group_info.id);
    });
}

// Gets an array of group objects
GraphClient.prototype.listGroups = async function() {
    return this.api('/groups').get();
}

GraphClient.prototype.getGroup = async function(id: string) {
    var path: string = '/groups/' + id;
    return this.api(path).get();
}

GraphClient.prototype.renameGroup = async function(id: string, name: string) {
    var path: string = '/groups/' + id;

    var content = {
      "displayName": name
    }

    return this.api(path).patch(content);
}

// Not currently supported by the API
/*GraphClient.prototype.deleteGroup = async function(group_id) {
    var path = '/v1.0/groups/' + group_id;
    this.api.delete(path, (err, response) => {
        if (err) {
            console.log(err);
        }
        console.log(response);
    });
}*/

GraphClient.prototype.addMemberToGroup = async function(group_id: string, user_id: string) {
    var path: string = '/groups/' + group_id + '/members/$ref';
    var user_uri: string = "https://graph.microsoft.com/v1.0/directoryObjects/" + user_id;
    var user_ref = {
        "@odata.id": user_uri
    }
    return this.api(path).post(user_ref);
}

//TODO: is this transitive?
GraphClient.prototype.removeMemberFromGroup = async function(group_id, user_id) {
    var path = '/groups/' + group_id + '/members/' + user_id + '/$ref';
    return this.api(path).delete();
}


GraphClient.prototype.listGroupMembers = async function(group_id: string) {
    var path: string = '/groups/' + group_id + '/members';
    return this.api(path).get();
}

GraphClient.prototype.getUser = async function(user_id: string) {
    var path: string = '/users/' + user_id;
    return this.api(path).get();
}

GraphClient.prototype.listUsers = async function(filter?) {
    if (filter) {
        return this.api('/users' + filter).get();
    }
    return this.api('/users').get();
}

// This is transitive
GraphClient.prototype.listUserGroupMembership = async function(user_id: string) {
    var path = '/users/' + user_id + '/getMemberGroups';
    return this.api(path).get();
}

GraphClient.prototype.createUser = async function(username: string, password: string) {
    let displayName: string = username;
    let mailNickname: string = displayName + "-mail";

    let content = {
        "accountEnabled": true,
        "displayName": displayName,
        "mailNickname": mailNickname,
        "userPrincipalName": displayName + "@" + this.tenant_name,
        "passwordProfile" : {
            "forceChangePasswordNextSignIn": false,
            "password": password
        }
    }

    return this.api('/users').post(content);
}

GraphClient.prototype.deleteUser = async function(id: string) {
    let path: string = '/users/' + id;
    return this.api(path).delete();
}
