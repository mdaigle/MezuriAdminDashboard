"use strict";

import path from 'path';
import fs from 'fs';
import rp from 'request-promise-native';

const resourceUri = 'https://graph.microsoft.com/';
const tokenUrl = 'http://localhost:5000/token';
const webpackJsonPath = '../webpack-assets.json';

export const scripts = JSON.parse(fs.readFileSync(path.resolve(__dirname, webpackJsonPath)));

export function getJsByName(names) {
    return names.map((name) => ({ src: scripts[name].js }));
}

export async function getToken(req) {
    return await rp(tokenUrl, {
        qs: {
            resource: resourceUri
        },
        headers: {
            Cookie: Object.entries(req.cookies).map((c) => c[0] + "=" + c[1]).join("; ")
        }
    });
}