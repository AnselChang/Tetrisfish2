import * as express from 'express';
import * as path from 'path';
import * as morgan from 'morgan'; // Import Morgan

//import * as livereload from 'livereload';
//import * as connectLivereload from 'connect-livereload';


import { Express, Request, Response } from 'express';
import { auth, authCallback } from './routes/auth';

import * as session from 'express-session';
import { SessionState } from './database/session-state';
import { Database } from './services/database';
import { username } from './routes/user-info';
declare module 'express-session' {
    export interface SessionData {
      state?: SessionState; // Add your custom session properties here
    }
  }

require('dotenv').config();

export default async function createApp(): Promise<Express> {
    const app = express();
    const clientDir = path.join(__dirname, '../public');

    app.use(morgan('dev'));

    app.use(session({
        secret: process.env['SESSION_SECRET']!,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // for HTTPS. set secure to false if using HTTP
    }));

    // set response to json
    app.use(express.json());

    // connct to MongoDB
    await Database.connect();


        // In development, refresh Angular on save just like ng serve does
    let livereloadServer: any;
    if (process.env['NODE_ENV'] !== 'production') {

        import('livereload').then(livereload => {
                const livereloadServer = livereload.createServer();
                livereloadServer.watch(clientDir);
                livereloadServer.once('connection', () => {
                    setTimeout(() => livereloadServer.refresh('/'), 100);
                });
            });

            import('connect-livereload').then(connectLivereload => {
                app.use(connectLivereload());
            });
    }

    app.use(express.static(clientDir));
    app.get('/api/stackrabbit', async (req: Request, res: Response) => {
        const url = req.query['url'];
        console.log("Making request to Stack Rabbit API:", url);

        const result = await fetch(url as string);

        try {
            const json = await result.json();
            res.send(json);
        } catch (e) {
            console.log("Error parsing JSON from Stack Rabbit API:", e);
        }
        console.log(result.status);
    });

    app.get('/api/auth', auth);
    app.get('/api/auth/callback', authCallback);
    app.get('/api/username', username) // FAST, does not require database lookup

    // catch all invalid api routes
    app.get('/api/*', (req, res) => {
        res.status(404).send("Invalid API route");
    });

    // Catch all routes and return the index file
    app.get('/*', (req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });

    return app;
}