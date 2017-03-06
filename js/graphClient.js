'use strict';

import * as graph from '@microsoft/microsoft-graph-client';
import Axios from 'axios';

export default async function graphClient() {
    let response;
    try {
        response = await Axios.get('/token', {
            params: {
                resource: graph.GRAPH_BASE_URL
            }
        });
    } catch (error) {
        console.error(error)
    }

    return graph.Client.init({
        authProvider: (done) => {
            done(null, response.data)
        }
    });
}