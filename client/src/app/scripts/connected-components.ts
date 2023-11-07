import { Point } from "../models/capture-models/point";
import { Grid } from "../models/tetronimo-models/binary-grid";

function dfs(grid: Grid, visited: boolean[][], start: Point, component: Point[]): void {
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // Directions: up, right, down, left
    const stack: Point[] = [start];

    while (stack.length > 0) {
        const { x, y } = stack.pop()!;
        if (visited[x][y]) {
            continue;
        }

        visited[x][y] = true;
        component.push({ x, y });

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (newX >= 0 && newY >= 0 && newX < grid.numRows && newY < grid.numCols &&
                !visited[newX][newY] && grid.exists(newX, newY)) {
                stack.push({ x: newX, y: newY });
            }
        }
    }
}

// Returns the first 4-connected component found in the grid
export function findFourConnectedComponent(grid: Grid): Point[] | null {
    const visited: boolean[][] = Array.from({ length: grid.numRows }, () => Array(grid.numCols).fill(false));
    let closestComponent: Point[] | null = null;

    for (let i = 0; i < grid.numRows; i++) {
        for (let j = 0; j < grid.numCols; j++) {
            if (!visited[i][j] && grid.exists(i, j)) {
                const component: Point[] = [];
                dfs(grid, visited, { x: i, y: j }, component);

                if (component.length === 4) {
                    if (!closestComponent || closestComponent[0].x > component[0].x) {
                        closestComponent = component;
                    }
                }
            }
        }
    }

    return closestComponent;
}
