import axios from 'axios';
import { Request, Response } from 'express';

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
    console.log(token);

    const redirectURL = `${getBaseURL(req)}/home`;
    res.redirect(redirectURL);

}