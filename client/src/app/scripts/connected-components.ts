import { Point } from "../models/capture-models/point";
import { Grid } from "../models/tetronimo-models/binary-grid";

function dfs(grid: Grid, visited: boolean[][], start: Point, component: Point[]): void {
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // Directions: up, right, down, left
    const stack: Point[] = [start];

    while (stack.length > 0) {
        const { x, y } = stack.pop()!;
        if (visited[y][x]) {
            continue;
        }

        visited[y][x] = true;
        component.push({ x, y });

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (newX >= 0 && newY >= 0 && newX < grid.numCols && newY < grid.numRows &&
                !visited[newY][newX] && grid.exists(newX, newY)) {
                stack.push({ x: newX, y: newY });
            }
        }
    }
}

export function printVisited(visited: boolean[][]): void {
    let result = "";
    for (let row = 0; row < visited.length; row++) {
        for (let col = 0; col < visited[row].length; col++) {
            result += visited[row][col] ? "1" : "0";
        }
        result += "\n";
    }
    console.log(result);
}

// Returns the first 4-connected component found in the grid
export function findFourConnectedComponent(grid: Grid): Point[] | null {
    const visited: boolean[][] = Array.from({ length: grid.numRows }, () => Array(grid.numCols).fill(false));

    for (let row = 0; row < grid.numRows; row++) {
        for (let col = 0; col < grid.numCols; col++) {
            if (!visited[row][col] && grid.exists(col, row)) {
                const component: Point[] = [];
                dfs(grid, visited, { x: col, y: row }, component);

                if (component.length === 4) {
                    return component;
                }
            }
        }
    }

    return null;
}
