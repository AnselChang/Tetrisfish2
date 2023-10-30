// an interface for an object that can return the color of a pixel at a given coordinate
export interface PixelReader {
    getPixelAt(x: number, y: number): [number, number, number] | undefined;
}