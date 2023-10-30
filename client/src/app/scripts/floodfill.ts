import { Rectangle } from "../models/game-models/capture-settings";

type Point = {
    x: number;
    y: number;
};

export interface FloodFillImage {
    getPixelAt(x: number, y: number): [number, number, number] | undefined;
}

export class FloodFill {
    private width: number;
    private height: number;
    private filled: boolean[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.filled = Array.from({ length: height }, () => Array(width).fill(false));
    }

    public floodfill(
        image: FloodFillImage,
        startX: number,
        startY: number,
        isSimilar: (colorA: [number, number, number], colorB: [number, number, number]) => boolean
    ): void {

        this.filled = Array.from({ length: this.height }, () => Array(this.width).fill(false));

        const startColor = image.getPixelAt(startX, startY);
        if (!startColor) return;
    
        const stack: Point[] = [];
        stack.push({ x: startX, y: startY });
    
        while (stack.length) {
            const { x, y } = stack.pop()!;
            const currentColor = image.getPixelAt(x, y);

            if (
                currentColor &&
                !this.filled[y][x] &&
                isSimilar(startColor, currentColor)
            ) {
                this.filled[y][x] = true;
                const neighbors = [
                    { x: x + 1, y },     // Right
                    { x: x - 1, y },     // Left
                    { x, y: y + 1 },     // Down
                    { x, y: y - 1 },     // Up
                    { x: x + 1, y: y + 1 }, // Bottom right diagonal
                    { x: x - 1, y: y + 1 }, // Bottom left diagonal
                    { x: x + 1, y: y - 1 }, // Top right diagonal
                    { x: x - 1, y: y - 1 }  // Top left diagonal
                ];
    
                for (const neighbor of neighbors) {
                    if (
                        neighbor.x >= 0 && neighbor.x < this.width &&
                        neighbor.y >= 0 && neighbor.y < this.height
                    ) {
                        stack.push(neighbor);
                    }
                }
            }
        }
    }

    public getFilled(): boolean[][] {
        return this.filled;
    }

    public getRect(): Rectangle | undefined {

        const matrix = this.filled;

        let minY = matrix.length;
        let maxY = -1;
        let minX = matrix[0]?.length || 0;
        let maxX = -1;
    
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x]) {
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                }
            }
        }
    
        if (minY <= maxY && minX <= maxX) {
            return {
                top: minY,
                bottom: maxY,
                left: minX,
                right: maxX
            };
        }
    
        return undefined; // No true values found in the matrix
    }
    
}
