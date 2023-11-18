import { Request, Response } from 'express';
import { addBugReport, doesBugReportExist, getBugReport } from '../database/bug-report/bug-report-service';
import DiscordBot from '../singletons/discord-bot';

// returns the username for the active session. Does not require database lookup
// req.body = {
//     "gameID": string
//     "username": string
//     "startlevel": number
//     "endLines": number
//     "endScore": number
//     "data": json
// }
export async function sendBugReportRoute(discordBot: DiscordBot, req: Request, res: Response) {

    let username = req.session?.state?.username;
    if (!username) username = "Anonymous";
    console.log("Bug report from user:", username);

    // extract the data from the request
    const { gameID, startlevel, endLines, endScore, data } = req.body;

    // check if the game already exists, and if so, return an error
    const exists = await doesBugReportExist(gameID);
    if (exists) {
        console.error("Bug report already exists:", gameID);
        res.status(409).send({error : "Bug report already exists"});
        return;
    }

    // Save the bug report to the database and get the id
    const description = `Level ${startlevel} start game ended with score of ${endScore} at ${endLines} ${endLines === 1 ? 'line' : 'lines'}`;
    await addBugReport(gameID, { username, description, data });

    // assemble url. make sure client handles the same url format
    const url = `https://tetrisfish.com/debug/?id=${gameID}`;

    // Send the bug report to the discord channel
    await discordBot.sendBugReport(username, description, url);
    console.log("Bug report sent to discord", username, description, url, data);

    res.status(200).send({success: true});

}

export async function getBugReportRoute(req: Request, res: Response) {
    const id = req.query['id'] as string;

    const exists = await doesBugReportExist(id);
    if (!exists) {
        console.error("Bug report does not exist:", id);
        res.status(404).send({error : "Bug report does not exist"});
        return;
    }

    const bugReport = await getBugReport(id);
    res.status(200).send(bugReport);
}