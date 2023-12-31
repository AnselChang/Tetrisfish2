import axios from 'axios';
import { Request, Response } from 'express';
import { SessionState } from '../database/session-state';
import { createNewUser, doesUserExist, getUserByID } from '../database/user/user-service';

const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';

function getBaseURL(req: Request): string {
    return process.env['BASE_URL']!;
}

function getCallbackURL(req: Request) {
    const baseUrl = getBaseURL(req);
    console.log("Base URL:", baseUrl);
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

// from the access token during auth, get the discord user info
async function getUserFromAuth(accessToken: string) {

    const uri = `${DISCORD_API_ENDPOINT}/users/@me`;
    const response = await fetch(uri, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${accessToken}`}
    });
    const discordUser = await response.json();
    console.log("Discord user", discordUser);
    return discordUser;
}

const DEBUG_DISCORD_ID = "0";
const DEBUG_USERNAME = "debug";

export async function authRoute(req: Request, res: Response) {

    // if on DEBUG MODE, login as user "debug" with ID 0
    if (process.env['PRODUCTION'] !== 'true') {
        console.log("DEBUG MODE ON");
        req.session.state = new SessionState(DEBUG_DISCORD_ID, DEBUG_USERNAME, false);

        // check if user exists in database
        const userExists = await doesUserExist(DEBUG_DISCORD_ID);

        // if not, create new user
        if (!userExists) {
            await createNewUser(DEBUG_DISCORD_ID, DEBUG_USERNAME);
        }

        const userRedirect = req.query['redirect'] as string;
        const redirectURL = `${getBaseURL(req)}/on-login?redirect=${userRedirect}&new-user=false`;
        res.redirect(redirectURL);
        return;
    }

    const clientID = process.env['DISCORD_CLIENT_ID'];
    console.log("Client ID:", clientID);

    const userRedirect = req.query['redirect'] as string;
    req.session.redirect = userRedirect;

    const redirectURL = getCallbackURL(req);
    console.log("After discord, redirect to URL:", redirectURL);

    const discordURI = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURL)}&response_type=code&scope=identify`
    console.log("Redirect to discord", discordURI);
    res.redirect(discordURI);

}

export async function authCallbackRoute(req: Request, res: Response) {
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
    
    // make API request to discord to get user info
    const discordUser = await getUserFromAuth(token['access_token']);
    const discordID = discordUser['id'] as string;
    let username = discordUser['global_name'] as string;
    if (username === undefined || username === null) {
        console.log("global_name is undefined or null, trying username");
        username = discordUser['username'] as string;
        console.log("Username:", username);
        if (username === undefined || username === null) {
            username = "Unknown";
            console.log("Both username and global name is undefined or null, setting to Unknown");
        }
    }

    // check if user exists in database
    const userExists = await doesUserExist(discordID);

    // if not, create new user
    if (!userExists) {
        await createNewUser(discordID, username);
    }

    const user = await getUserByID(discordID);
    
    // store in session
    req.session.state = new SessionState(discordID, username, user!.isProUser);
    
    // redirect to home page, specifying if user is new
    const userRedirect = req.session.redirect;
    const redirectURL = `${getBaseURL(req)}/on-login?redirect=${userRedirect}&new-user=${userExists ?'false':'true'}`;
    res.redirect(redirectURL);

}