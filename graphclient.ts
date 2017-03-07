const msgraph = require("@microsoft/microsoft-graph-client");
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"

module.exports = GraphClient;

function GraphClient(accessToken: string) {
    this.client = msgraph.Client.init({
        authProvider: (done) => {
            done(null, accessToken); //first parameter takes an error if you can't get an access token
        }
    });
}

GraphClient.prototype.createSecurityGroup = function(group_name: string, callback: (input: MicrosoftGraph.Group) => void) {
    var content = {
      "displayName": group_name,
      "mailEnabled": false, //We don't want a mail group
      "mailNickname": "testMail",
      "securityEnabled": true //Need this set to true to create a security group
    }

    this.client.api('/groups')
        .version("beta")
        .post(content, (err, res) => {
            if (err) {
                console.log(err);
            }
            let group: MicrosoftGraph.Group = res.value;
            callback(group);
        });
}

GraphClient.prototype.createSecuritySubgroup = function(parent_group_id: string, child_group_name: string) {
    this.createSecurityGroup(child_group_name, function(group_info: MicrosoftGraph.Group) {
        this.addMemberToGroup(parent_group_id, group_info.id);
    });
}

// Gets an array of group objects
GraphClient.prototype.listGroups = function(callback: (input: MicrosoftGraph.Group[]) => void) {
    this.client.api('/groups')
        .get((err, response) => {
            if (err) {
                console.log(err);
            }
            let groups: MicrosoftGraph.Group[] = response.value;
            callback(groups);
        });
}

GraphClient.prototype.getGroup = function(id: string, callback: (input: MicrosoftGraph.Group) => void) {
    var path: string = '/groups/' + id;
    this.client.api(path)
        .get((err, response) => {
            if (err) {
                console.log(err);
            }
            let group: MicrosoftGraph.Group = response.value;
            callback(group);
        });
}

GraphClient.prototype.renameGroup = function(id: string, name: string, callback: (input: MicrosoftGraph.Group) => void) {
    var path: string = '/groups/' + id;

    var content = {
      "displayName": name
    }

    this.client.api(path)
        .patch(content, (err, response) => {
            if (err) {
                console.log(err);
            }
            let group: MicrosoftGraph.Group = response.value;
            callback(group);
        });
}

// Not currently supported by the API
/*GraphClient.prototype.deleteGroup = function(group_id) {
    var path = '/v1.0/groups/' + group_id;
    this.api.delete(path, (err, response) => {
        if (err) {
            console.log(err);
        }
        console.log(response);
    });
}*/

GraphClient.prototype.addMemberToGroup = function(group_id: string, user_id: string, callback: (input: Response) => void) {
    var path: string = '/groups/' + group_id + '/members/$ref';
    var user_uri: string = "https://graph.microsoft.com/v1.0/directoryObjects/" + user_id;
    var user_ref = {
        "@odata.id": user_uri
    }
    this.client.api(path)
        .post(user_ref, (err, response) => {
            if (err) {
                console.log(err);
            }
            let status: Response = response;
            callback(status);
        });
}

//TODO: is this transitive?
GraphClient.prototype.removeMemberFromGroup = function(group_id, user_id) {
    var path = '/groups/' + group_id + '/members/' + user_id + '/$ref';
    /*var user_uri = "https://graph.microsoft.com/v1.0/directoryObjects/" + user_id;
    var user_ref = {
        "@odata.id": user_uri
    }*/
    this.api.delete(path, (err, response) => {
        if (err) {
            console.log(err);
        }
        console.log(response);
    });
}


GraphClient.prototype.listGroupMembers = function(group_id: string, callback: (input: MicrosoftGraph.DirectoryObject[]) => void) {
    var path: string = '/groups/' + group_id + '/members';

    this.client.api(path)
        .get((err, response) => {
        if (err) {
            console.log(err);
        }
        let members: MicrosoftGraph.DirectoryObject[] = response.value;
        callback(response.value);
    });
}

GraphClient.prototype.getUser = function(user_id: string, callback: (input: MicrosoftGraph.User) => void) {
    var path: string = '/users/' + user_id;
    this.api.get(path, (err, response) => {
        if (err) {
            console.log(err);
        }

        let user: MicrosoftGraph.User = response.value;
        callback(user);
    });
}

GraphClient.prototype.listUsers = function(callback: (input: MicrosoftGraph.User[]) => void) {
    this.api.get('/users', (err, response) => {
        if (err) {
            console.log(err);
        }
        let users: MicrosoftGraph.User[] = response.value;
        callback(users);
    });
}

// This is transitive
GraphClient.prototype.listUserGroupMembership = function(user_id: string, callback: (input: string[]) => void) {
    var path = '/users/' + user_id + '/getMemberGroups';
    this.api.get(path, (err, response) => {
        if (err) {
            console.log(err);
        }
        let memberIds: string[] = response.value;
        callback(memberIds);
    });
}

GraphClient.prototype.createUser = function(username: string, password: string, callback: (input: MicrosoftGraph.User) => void) {
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

    //console.log(content);

    this.client.api('/users')
        .post(content, (err, response) => {
            if (err) {
                console.log(err);
            }
            let user: MicrosoftGraph.User = response;
            callback(response);
        });
}

GraphClient.prototype.deleteUser = function(id: string, callback: (status: Response) => void) {
    let path: string = '/users/' + id;
    this.client.api(path)
        .delete((err, response) => {
            if (err) {
                console.log(err);
            }
            let status: Response = response;
            callback(status);
        });
}
