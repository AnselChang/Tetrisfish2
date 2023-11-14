import { Request, Response } from 'express';

function getBaseURL(req: Request) {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}`;
}

export async function auth(req: Request, res: Response) {

    const clientID = process.env['DISCORD_CLIENT_ID'];
    console.log("Client ID:", clientID);

    const baseUrl = getBaseURL(req);
    const redirectURL = baseUrl + "/api/auth/callback";
    console.log("After discord, redirect to URL:", redirectURL);

    const discordURI = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`
    console.log("Redirect to discord", discordURI);
    res.redirect(discordURI);

}

export async function authCallback(req: Request, res: Response) {
    console.log("Auth callback", req.query);

    // do auth things


    const redirectURL = `${getBaseURL(req)}/home`;
    res.redirect(redirectURL);

}