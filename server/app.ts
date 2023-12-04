import * as express from 'express';
import * as path from 'path';
import * as morgan from 'morgan'; // Import Morgan

//import * as livereload from 'livereload';
//import * as connectLivereload from 'connect-livereload';


import { Express, Request, Response } from 'express';
import { authRoute, authCallbackRoute } from './routes/auth';

import * as session from 'express-session';
import { SessionState } from './database/session-state';
import { getUserSettingsRoute, setUserSettingsRoute, usernameRoute } from './routes/user-info';
import { getBugReportRoute, sendBugReportRoute } from './routes/bug-report';
import { Database } from './singletons/database';
import DiscordBot from './singletons/discord-bot';
import { getGameRoute, getGamesByPlayerRoute, sendGameRoute } from './routes/game';
import { getGlobalStatsRoute } from './routes/global-stats';
import { LeaderboardType } from './database/leaderboard/leaderboard-schema';
import { getLeaderboardAccuraciesRoute, getLeaderboardRoute } from './routes/leaderboard';
import { MultiplayerManager } from './multiplayer/multiplayer-manager';
import { createRoomRoute, doesRoomExistRoute, joinRoomPlayRoute, leaveRoomRoute } from './routes/multiplayer';


declare module 'express-session' {
    export interface SessionData {
      state?: SessionState; // Add your custom session properties here
      redirect?: string;
    }
  }

// TypeScript interface for extended request
interface ExtendedRequest extends Request {
    rawBody: string;
  }

require('dotenv').config();

export default async function createApp(): Promise<{
    app : Express,
    database: Database,
    discordBot: DiscordBot,
    multiplayer: MultiplayerManager
}> {
    const app = express();
    const clientDir = path.join(__dirname, '../../public');

    app.use(morgan('dev'));

    app.use(session({
        secret: process.env['SESSION_SECRET']!,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // for HTTPS. set secure to false if using HTTP
    }));

    // set response to json
    app.use(express.json({limit: '50mb'}));

    // connct to MongoDB
    const database = new Database();
    await database.connect();

    // connect to discord
    const discordBot = new DiscordBot();

    // multiplayer manager
    const multiplayer = new MultiplayerManager();

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

    app.get('/api/auth', authRoute);
    app.get('/api/auth/callback', authCallbackRoute);
    app.get('/api/username', usernameRoute) // FAST, does not require database lookup
    
    app.post('/api/set-user-settings', setUserSettingsRoute);
    app.get('/api/get-user-settings', getUserSettingsRoute);

    app.post('/api/send-bug-report', (req: Request, res: Response) => sendBugReportRoute(discordBot, req, res));
    app.get('/api/get-bug-report', (req: Request, res: Response) => getBugReportRoute(req, res));

    app.post('/api/send-game', (req: Request, res: Response) => sendGameRoute(req, res));
    app.get('/api/get-game', (req: Request, res: Response) => getGameRoute(req, res));
    app.get('/api/get-games-by-player', (req: Request, res: Response) => getGamesByPlayerRoute(req, res));

    app.get('/api/get-global-stats', async (req: Request, res: Response) => getGlobalStatsRoute(req, res));

    app.get('/api/get-leaderboard-overall', async (req: Request, res: Response) => getLeaderboardRoute(req, res, LeaderboardType.OVERALL));
    app.get('/api/get-leaderboard-29', async (req: Request, res: Response) => getLeaderboardRoute(req, res, LeaderboardType.START_29));
    app.get('/api/get-leaderboard-accuracy-overall', async (req: Request, res: Response) => getLeaderboardAccuraciesRoute(req, res, LeaderboardType.OVERALL));
    app.get('/api/get-leaderboard-accuracy-29', async (req: Request, res: Response) => getLeaderboardAccuraciesRoute(req, res, LeaderboardType.START_29));

    app.post('/api/multiplayer/create-room', async (req: Request, res: Response) => createRoomRoute(multiplayer, req, res));
    app.post('/api/multiplayer/join-room-play', async (req: Request, res: Response) => joinRoomPlayRoute(multiplayer, req, res));
    app.get('/api/multiplayer/does-room-exist', async (req: Request, res: Response) => doesRoomExistRoute(multiplayer, req, res));
    app.post('/api/multiplayer/leave-room', async (req: Request, res: Response) => { leaveRoomRoute(multiplayer, req, res) });

    // catch all invalid api routes
    app.get('/api/*', (req, res) => {
        res.status(404).send("Invalid API route");
    });

    // Catch all routes and return the index file
    app.get('/*', (req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });

    return {
        app,
        database,
        discordBot,
        multiplayer
    }
}