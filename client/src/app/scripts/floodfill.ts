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
    ): boolean[][] {
        const startColor = image.getPixelAt(startX, startY);
        if (!startColor) return this.filled;
    
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

        return this.filled;
    }
    
}
