# Tetrisfish...
...is the largest effort in NES history to bring NES Tetris online. NES Tetris is traditionally played on a NES console and controller as a solo game, requiring a CRT as a display. This has been the largest barrier to accessibility and its potential as a large-scale esports game. Yet, online NES Tetris emulators fall short due to its crippling input delay. The web app https://www.tetrisfish.com aims to bridge this gap as:
- An advanced OCR engine to directly capture gameplay from original hardware in realtime
- An integrated emulator to play NES tetris directly on the site, with runahead to combat input delay
- A massive database of every tetris played on tetrisfish, forever. So players can review all their past games
- An immersive dashboard for players to track their progress over time.
- A full suite of analysis tools powered by StackRabbit, the strongest NES Tetris AI in the world. Players can review their games and get qualtiative feedback on their stacking decisions.
- A puzzle trainer extracted directly from real games so players can improve their stacking.
- A sandbox to play with and learn from various configurable NES Tetris AIs
- Multiplayer rooms, equipped with admin controls, scoring, and live chat, so that multiple players and AIs can play together in realtime

...but the ultimate goal of tetrisfish is an ambitious one. I aim for a full ranked multiplayer system not unlike chess.com. Players can battle other players and bots in realtime to gain elo and rank up in the leaderboards. But to pull this off, every previously mentioned feature needs to be tuned to perfection. And thus sets the massive scope I hope to pull off.

## To join the community

You can play tetrisfish on: https://www.tetrisfish.com

Follow our development through our active discord community: https://discord.gg/4xkBHvGtzp
Support development and server costs on Patreon: https://patreon.com/tetrisfish

This web-app is a complete reimagination of my previous software, Tetrisfish 1.0, which is a Python/Pygame OCR and analysis tool. You can find a promotional video of the original v1.0 software here: https://www.youtube.com/watch?v=eY0oGto8Boo&ab_channel=Ansel

## To contribute

Contributions to any aspect of tetrisfish are extremely appreciated. This is a huge work-in-progress with many many flaws and incomplete features at its current stage, and every helping hand pushes us closer to our goal.

To start, I'd recommend gaining familiarity with using tetrisfish and its features first. All development is done through our discord server. In addition, it may be helpful to read this for some technical background on tetrisfish: https://docs.google.com/document/d/1ssTFX7OWgNfHRVBUCPC9Th881hQzU0IoWAp62LzRAjM/edit?usp=sharing

Tetrisfish is a web-app built on the MEAN stack (MongoDB, Express, Angular, Node) and hosted on heorku.

`npm run build` - Build both client and server.
`npm run build:client` - Build the client.
`npm run build:server` - Build the server.
`npm start` - Run full application in production mode.
`git push heroku main` - Deploy build in main branch to heroku. Only Ansel has permissions for this.