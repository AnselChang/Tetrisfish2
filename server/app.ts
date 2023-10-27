import * as express from 'express';
import * as path from 'path';
//import * as livereload from 'livereload';
//import * as connectLivereload from 'connect-livereload';


import { Express, Request, Response } from 'express';
export default function createApp(): Express {
    const app = express();
    const clientDir = path.join(__dirname, '../public');

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
        const json = await result.json();
        console.log("Result:", json);
        res.send(json);
    });

    // Catch all routes and return the index file
    app.get('/*', (req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });

    return app;
}