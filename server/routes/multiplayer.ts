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

    if (!userID) {
        res.status(200).send({
            success: false,
            error: "User not logged in"
        });
        return;
    }

    if (!result) {
        res.status(200).send({
            success: false,
            error: "Invalid access code"
        });
        return;
    }

    const {room, slot} = result;
    
    res.status(200).send({
        success: true,
        roomID: room.roomID,
        slotID: slot.slotID
    });
}

export async function doesRoomExistRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const roomID = req.query['roomID'] as string;
    const room = multiplayer.getRoomByID(roomID);

    console.log(`doesRoomExistRoute ${roomID} ${room}`);

    if (!room) {
        res.status(200).send({
            success: false,
        });
        return;
    } else {
        res.status(200).send({
            success: true,
        });
    }

}

export async function leaveRoomRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const userID = req.body['userID'] as string;
    const roomID = req.body['roomID'] as string;

    const room = multiplayer.getRoomByID(roomID);

    if (!room) {
        res.status(200).send({
            success: false,
            error: "Room not found"
        });
        return;
    }

    room.removeHumanFromRoom(userID);
    res.status(200).send({
        success: true
    });
}