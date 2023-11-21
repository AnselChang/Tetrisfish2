import { Request, Response } from 'express';
import { getCounts } from '../database/global-stats/global-stats-service';

export async function getGlobalStatsRoute(req: Request, res: Response) {
    const counts = await getCounts();
    res.status(200).send(counts);
}