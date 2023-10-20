`npm run clean` - will clean out the directories where the compiled output goes in case we need to make a fresh start.

`npm run cp:www` - This copies ./server/bin/www to its proper location.

`npm run dev` - Using Concurrently, we compile Typescript files every time there are changes, run the files in Node and watch for changes with Nodemon, then watch for changes to the Angular files and build those accordingly.