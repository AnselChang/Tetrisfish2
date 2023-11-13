`npm start` - Run full application in production mode.

`npm run build:client` - Build the client.

`npm run build:server` - Build the server.

`npm run deploy` - Deploys the current build to heroku. Requires the existence of a remote named `local`, which must point to the absolute path of this local repository.

`npm run clean` - will clean out the directories where the compiled output goes in case we need to make a fresh start.

`npm run cp:www` - This copies ./server/bin/www to its proper location.

`npm run dev` - Run in dev-friendly mode with HMR.
