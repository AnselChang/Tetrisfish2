import axios from "axios";

// Function to generate a random board
const generateRandomBoard = (): string => {
return Array.from({ length: 200 }, () => Math.random() > 0.5 ? '1' : '0').join('');
};

// Base URLs
const url1 = "https://stackrabbit.herokuapp.com/engine-movelist";
const url2 = "http://24.144.70.115:3000/engine-movelist";

// Fixed parameters
const params = {
currentPiece: "J",
level: "18",
lines: "110",
inputFrameTimeline: "X....."
};

// Function to convert parameters to query string
const toQueryString = (params: Record<string, string>): string => {
return new URLSearchParams(params).toString();
};

// Function to measure response time for a fetch call
const measureResponseTime = async (url: string, params: any): Promise<number> => {
const startTime = new Date().getTime();
await axios.get(`${url}?${toQueryString(params)}`);
const endTime = new Date().getTime();
return endTime - startTime;
};

// Function to perform benchmark
export async function runBenchmark(): Promise<any> {
    let total_time_api1 = 0;
    let total_time_api2 = 0;
    const num_calls = 10;

    for (let i = 0; i < num_calls; i++) {
        const board = generateRandomBoard();
        const currentParams = { ...params, board };

        // Measure response time for API 1
        total_time_api1 += await measureResponseTime(url1, currentParams);

        // Measure response time for API 2
        total_time_api2 += await measureResponseTime(url2, currentParams);
    }

    // Calculating the average response time
    const avg_time_api1 = total_time_api1 / num_calls;
    const avg_time_api2 = total_time_api2 / num_calls;

    return {
        [url1]: avg_time_api1,
        [url2]: avg_time_api2
    }

}