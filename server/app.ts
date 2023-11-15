import * as express from 'express';
import * as path from 'path';
import * as morgan from 'morgan'; // Import Morgan

//import * as livereload from 'livereload';
//import * as connectLivereload from 'connect-livereload';


import { Express, Request, Response } from 'express';
import { auth, authCallback } from './routes/auth';

import * as session from 'express-session';
import { SessionState } from './models/session-state';
declare module 'express-session' {
    export interface SessionData {
      state?: SessionState; // Add your custom session properties here
    }
  }

require('dotenv').config();

export default function createApp(): Express {
    const app = express();
    const clientDir = path.join(__dirname, '../public');

    app.use(morgan('dev'));

    app.use(session({
        secret: process.env['SESSION_SECRET']!,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true } // for HTTPS. set secure to false if using HTTP
    }));


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

    // Catch all routes and return the index file
    app.get('/*', (req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });

    return app;
}