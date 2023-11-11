"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const morgan = require("morgan"); // Import Morgan
function createApp() {
    const app = express();
    const clientDir = path.join(__dirname, '../public');
    app.use(morgan('dev'));
    // In development, refresh Angular on save just like ng serve does
    let livereloadServer;
    if (process.env['NODE_ENV'] !== 'production') {
        Promise.resolve().then(() => require('livereload')).then(livereload => {
            const livereloadServer = livereload.createServer();
            livereloadServer.watch(clientDir);
            livereloadServer.once('connection', () => {
                setTimeout(() => livereloadServer.refresh('/'), 100);
            });
        });
        Promise.resolve().then(() => require('connect-livereload')).then(connectLivereload => {
            app.use(connectLivereload());
        });
    }
    app.use(express.static(clientDir));
    app.get('/api/stackrabbit', async (req, res) => {
        const url = req.query['url'];
        console.log("Making request to Stack Rabbit API:", url);
        const result = await fetch(url);
        try {
            const json = await result.json();
            res.send(json);
        }
        catch (e) {
            console.log("Error parsing JSON from Stack Rabbit API:", e);
        }
        console.log(result.status);
    });
    // Catch all routes and return the index file
    app.get('/*', (req, res) => {
        res.sendFile(path.join(clientDir, 'index.html'));
    });
    return app;
}
exports.default = createApp;
//# sourceMappingURL=app.js.map