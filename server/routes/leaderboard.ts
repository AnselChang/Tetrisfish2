import { Request, Response } from 'express';
import { LeaderboardType } from '../database/leaderboard/leaderboard-schema';
import { getLeaderboard, getLeaderboardAccuracies } from '../database/leaderboard/leaderboard-service';

// sends a LeaderboardEntry[] list for the given leaderboard type
export async function getLeaderboardRoute(req: Request, res: Response, type: LeaderboardType) {

    const leaderboard = await getLeaderboard(type);
    res.status(200).send(leaderboard);

}

// sends a number[] list of accuracies for the given leaderboard type
export async function getLeaderboardAccuraciesRoute(req: Request, res: Response, type: LeaderboardType) {

    const leaderboardAccuracies = await getLeaderboardAccuracies(type);
    res.status(200).send(leaderboardAccuracies);

}