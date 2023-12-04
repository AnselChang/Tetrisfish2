import { Request, Response } from 'express';
import { MultiplayerManager } from '../multiplayer/multiplayer-manager';

export async function createRoomRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const userID = req.body['userID'] as string;
    const newRoom = multiplayer.createNewRoom(userID);

    res.status(200).send({
        success: true,
        roomID: newRoom.roomID
    });

}