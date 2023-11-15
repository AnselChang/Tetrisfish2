import axios from 'axios';
import { Request, Response } from 'express';
import { SessionState } from '../database/session-state';
import { createNewUser, doesUserExist } from '../database/user/user-service';

const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

function getBaseURL(req: Request) {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}`;
}

function getCallbackURL(req: Request) {
    const baseUrl = getBaseURL(req);
    return baseUrl + "/api/auth/callback";
}

async function exchangeCode(req: Request, code: string): Promise<any> {
    const data = new URLSearchParams({
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': getCallbackURL(req),
    });
  
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    const clientID = process.env['DISCORD_CLIENT_ID']!;
    const clientSecret = process.env['DISCORD_CLIENT_SECRET']!;
    const uri = `${DISCORD_API_ENDPOINT}/oauth2/token`;

    console.log("Client ID:", clientID);
    console.log("Client Secret:", clientSecret);
    console.log("URI:", uri);

  
    try {
        const response = await axios.post(uri, data, {
            headers: headers,
            auth: {
                username: clientID,
                password: clientSecret
            }
        });
  
      return response.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
        throw new Error(`Error in exchangeCode: ${error.message}`);
        } else {
        throw new Error(`An unexpected error occurred: ${error}`);
        }
    }
}

// for the session, get the discord user info
async function getSessionAuthDiscordUser(req: Request) {
    const accessToken = req.session.state?.accessToken;
    if (!accessToken) throw new Error("Not in session");

    const uri = `${DISCORD_API_ENDPOINT}/users/@me`;
    const response = await fetch(uri, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${accessToken}`}
    });
    const discordUser = await response.json();
    console.log("Discord user", discordUser);
    return discordUser;
}

export async function auth(req: Request, res: Response) {

    const clientID = process.env['DISCORD_CLIENT_ID'];
    console.log("Client ID:", clientID);

    const redirectURL = getCallbackURL(req);
    console.log("After discord, redirect to URL:", redirectURL);

    const discordURI = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`
    console.log("Redirect to discord", discordURI);
    res.redirect(discordURI);

}

export async function authCallback(req: Request, res: Response) {
    console.log("Auth callback", req.query);

    // do auth things
    const code = req.query['code'] as string;

    /* (EXAMPLE) token = {
        "access_token": "6qrZcUqja7812RVdnEKjpzOL4CvHBFG",
        "token_type": "Bearer",
        "expires_in": 604800,
        "refresh_token": "D43f5y0ahjqew82jZ4NViEr2YafMKhue",
        "scope": "identify"
    } */
    const token = await exchangeCode(req, code);
    console.log("Discord token", token);

    // store the token in the session
    req.session.state = new SessionState(token['access_token'], token['refresh_token']);
    
    // make API request to discord to get user info
    const discordUser = await getSessionAuthDiscordUser(req);
    const discordID = discordUser['id'] as string;
    const displayName = discordUser['global_name'] as string;

    // check if user exists in database
    const userExists = await doesUserExist(discordID);

    // if not, create new user
    if (!userExists) {
        await createNewUser(discordID, displayName);
    }
    
    // redirect to home page, specifying if user is new
    const redirectURL = `${getBaseURL(req)}/home?new-user=${userExists ?'false':'true'}`;
    res.redirect(redirectURL);

}