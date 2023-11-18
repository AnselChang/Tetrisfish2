import { Request, Response } from 'express';
import { addBugReport, getBugReport } from 'server/database/bug-report/bug-report-service';
import DiscordBot from 'server/singletons/discord-bot';

// returns the username for the active session. Does not require database lookup
// req.body = {
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
    const { startlevel, endLines, endScore, data } = req.body;

    // Save the bug report to the database and get the id
    const description = `Level ${startlevel} start game ended with ${endLines} lines with ${endScore} score`;
    const id = await addBugReport({ username, description, data });

    // assemble url. make sure client handles the same url format
    const url = `https://tetrisfish.com/debug/?id=${id}`;

    // Send the bug report to the discord channel
    await discordBot.sendBugReport(username, description, url);
    console.log("Bug report sent to discord", username, description, url, data);

}

export async function getBugReportRoute(req: Request, res: Response) {
    const id = req.query['id'] as string;
    const bugReport = await getBugReport(id);
    res.send(bugReport);
}