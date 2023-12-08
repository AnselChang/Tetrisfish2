import { Request, Response } from 'express';
import { getPlacementsOn18 } from '../database/game/game-service';

export async function getPlacementsRoute(req: Request, res: Response) {

    const placements = await getPlacementsOn18();
    res.status(200).send(placements);

}