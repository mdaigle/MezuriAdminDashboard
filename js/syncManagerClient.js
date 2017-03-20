'use strict';

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

export default class syncManagerClient {
    constructor(req, res) {
        this.instances = JSON.parse(req.cookies[INSTANCES_COOKIE_KEY] || defaultInstances);
    }

    get validationPattern() {
        // starts with an alphabet followed with 0-20 alphanumeric or white space
        return /^[a-zA-z][a-zA-Z0-9\s]{0,20}/g
    }

    updateInstances(res, instanceName) {
        let newInstance;
        if (this.validateNewInstance(instanceName, this.validationPattern)) {
            newInstance = __createNewInstance(this, instanceName);
        } else {
            return false;
        }

        this.instances.push(newInstance);

        // res.cookie(INSTANCES_COOKIE_KEY, JSON.stringify(instances));

        return newInstance;
    }

    validateNewInstance(instanceName, pattern) {
        return pattern.test(instanceName);
    }
}

function __createNewInstance(client, instanceName) {
    let name = instanceName.trim();
    let id = __findUniqueId(name.replace(/\s/g, '_').toLowerCase(), new Set(client.instances.map(i => i.id)));
    let link = `http://${id}.mezuricloud.com/`;

    return {
        id: id,
        name: name,
        link: link
    }
}

function __findUniqueId(id, idSet) {
    let count = 0;

    while (idSet.has(id)) {
        if(count === 0) {
            id = id + '_' + ++count;
        } else {
            id[id.length - 1] = ++count;
        }
    }

    return id;
}