import DBGlobalStats, { GlobalStats } from "./global-stats-schema";

// if there is no stats document, create one
async function initializeStatsDocument() {
    const exists = await DBGlobalStats.findOne({});
    if (!exists) {
      const newStats = new DBGlobalStats({ placementCount: 0, gameCount: 0, puzzleCount: 0 });
      await newStats.save();
    }
  }

// Function to increment counts
export async function incrementCounts(increment: GlobalStats): Promise<void> {

    // Ensure there is a stats document
    await initializeStatsDocument();

    // Assuming there is only one document to update
    await DBGlobalStats.findOneAndUpdate({}, {
      $inc: {
        placementCount: increment.placementCount,
        gameCount: increment.gameCount,
        puzzleCount: increment.puzzleCount
      }
    });
  }
  
  // Function to get all counts
  export async function getCounts(): Promise<{ placementCount: number, gameCount: number, puzzleCount: number }> {

    const stats = await DBGlobalStats.findOne({});
    return {
      placementCount: stats?.placementCount ?? 0,
      gameCount: stats?.gameCount ?? 0,
      puzzleCount: stats?.puzzleCount ?? 0
    };
  }