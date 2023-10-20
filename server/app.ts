import * as express from 'express';
import * as path from 'path';
import * as livereload from 'livereload';
import * as connectLivereload from 'connect-livereload';

import { Express, Request, Response } from 'express';
export default function createApp(): Express {
    const app = express();
    const clientDir = path.join(__dirname, '../public');

    // In development, refresh Angular on save just like ng serve does
  let livereloadServer: any;
  if (process.env['NODE_ENV'] !== 'production') {
      livereloadServer = livereload.createServer();
      livereloadServer.watch(clientDir);
      app.use(connectLivereload());
      livereloadServer.once('connection', () => {
        setTimeout(() => livereloadServer.refresh('/'), 100);
      });
  }

    app.use(express.static(clientDir));
    app.get('/api/:name', async (req: Request, res: Response) => {
        const name = req.params['name'];
        const greeting = { greeting: `Hello, ${ name }` };
        res.send(greeting);
    });
    return app;
}