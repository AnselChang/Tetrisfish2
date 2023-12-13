import { Request, Response } from 'express';

export async function leoRoute(req: Request, res: Response) {

    const data = req.body;

    //console.log("Recieved data:", data);

    const url = "https://leo-the-lion-1102097bdb43.herokuapp.com/multi-predict";

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    if (!response.ok) res.status(500).send("Leo Server Error");

    const json = await response.json();


    //console.log("Recieved from python server:", json);
    res.status(200).send(json);

}