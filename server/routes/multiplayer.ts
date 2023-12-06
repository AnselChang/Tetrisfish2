import { Request, Response } from 'express';
import { MultiplayerManager } from '../multiplayer/multiplayer-manager';
import { SocketUser } from 'server/multiplayer/room';

export async function createRoomRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const userID = req.body['userID'] as string;
    const newRoom = await multiplayer.createNewRoom(userID);

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

export async function generateSlotAccessCodeRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {
    const slotID = req.body['slotID'] as string;
    if (!slotID) {
        res.status(200).send({
            success: false,
            error: "Invalid slotID"
        });
        return;
    }

    if (!multiplayer.doesSlotExist(slotID)) {
        res.status(200).send({
            success: false,
            error: "Slot does not exist"
        });
        return;
    }

    const result = multiplayer.accessCodes.generateAccessCode(slotID);
    res.status(200).send({
        success: true,
        accessCode: result
    });
}

export async function revokeSlotAccessCodeRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {
    const slotID = req.body['slotID'] as string;
    if (!slotID) {
        res.status(200).send({
            success: false,
            error: "Invalid slotID"
        });
        return;
    }

    if (!multiplayer.doesSlotExist(slotID)) {
        res.status(200).send({
            success: false,
            error: "Slot does not exist"
        });
        return;
    }

    multiplayer.accessCodes.revokeAccessCodeForSlot(slotID);
    res.status(200).send({
        success: true,
    });
}

export async function leaveRoomRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const userID = req.body['userID'] as string;
    const sessionID = req.body['sessionID'] as string;
    const roomID = req.body['roomID'] as string;

    const room = multiplayer.getRoomByID(roomID);

    if (!room) {
        res.status(200).send({
            success: false,
            error: "Room not found"
        });
        return;
    }

    room.removeHumanFromRoom(userID, sessionID);
    res.status(200).send({
        success: true
    });
}

export async function registerMyselfRoute(multiplayer: MultiplayerManager, req: Request, res: Response) {

    const userID = req.body['userID'] as string;
    const slotID = req.body['slotID'] as string;
    const sessionID = req.body['sessionID'] as string;

    if (!userID || !slotID || !sessionID) {
        res.status(200).send({
            success: false,
            error: "Invalid userID, sessionID, or slotID"
        });
        return;
    }

    const slot = multiplayer.getSlotByID(slotID);

    if (!slot) {
        res.status(200).send({
            success: false,
            error: "Slot not found"
        });
        return;
    }

    // check if userID is already in a slot
    if (slot.room.isUserSessionInSlot(sessionID)) {
        res.status(200).send({
            success: false,
            error: "User already in slot"
        });
        return;
    }

    // assign userID to slot
    await slot.assignHuman(userID, sessionID);

    // broadcast change
    slot.room.onChange();

    res.status(200).send({
        success: true,
    });
}