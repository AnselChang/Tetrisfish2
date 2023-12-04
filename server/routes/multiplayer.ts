import { Request, Response } from 'express';
import { MultiplayerManager } from '../multiplayer/multiplayer-manager';
import { SocketUser } from 'server/multiplayer/room';

export async function createRoomRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const userID = req.body['userID'] as string;
    const newRoom = multiplayer.createNewRoom(userID);

    res.status(200).send({
        success: true,
        roomID: newRoom.roomID
    });
}

export async function joinRoomPlayRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const accessCode = req.body['accessCode'] as number;
    const userID = req.body['userID'] as string;

    const result = multiplayer.getRoomAndSlotByAccessCode(accessCode);

    if (!result) {
        res.status(200).send({
            success: false,
            error: "Invalid access code"
        });
        return;
    }

    const {room, slot} = result;
    const success = room.addHumanToRoomWithSlot(userID, slot);

    if (!success) {
        res.status(200).send({
            success: false,
            error: "Slot is not in room"
        });
        return;
    } else {
        res.status(200).send({
            success: true,
            roomID: room.roomID,
            slotID: slot.slotID
        });
    }
}