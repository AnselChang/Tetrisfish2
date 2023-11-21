import mongoose from "mongoose";

export interface GlobalStats {
    placementCount: number,
    gameCount: number,
    puzzleCount: number
}

const GlobalStatsSchema = new mongoose.Schema({
    placementCount: { type: Number, default: 0 },
    gameCount: { type: Number, default: 0 },
    puzzleCount: { type: Number, default: 0 }
  });
  
  const DBGlobalStats = mongoose.model('DBGlobalStats', GlobalStatsSchema);
export default DBGlobalStats;