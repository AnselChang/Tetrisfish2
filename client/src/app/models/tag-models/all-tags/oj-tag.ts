import MoveableTetromino from "../../game-models/moveable-tetromino";
import { TetrominoType } from "../../tetronimo-models/tetromino";
import Tag, {TagExample } from "../abstract-tag";
import { SimplePlacement } from "../tag-assigner";
import { TagID } from "../tag-types";

export default class OJTag extends Tag {

    constructor() {
        super(
            TagID.OJ, "oj", "OJ",
            "Tuck the J under the O to allow for a flat surface above the formation",
            new TagExample(
                "",
                new MoveableTetromino(TetrominoType.O_TYPE, 0, 0, 0),
                new MoveableTetromino(TetrominoType.J_TYPE, 0, 0, 0)
            )
        );
    }

    public override identify(placement: SimplePlacement): boolean {

        /* example:
        J r=3, x=4, y=17
        O r=3, x=5, y=18
        */

        if (placement.current.tetrominoType !== TetrominoType.J_TYPE) return false;
        if (placement.next.tetrominoType !== TetrominoType.O_TYPE) return false;

        if (placement.current.getRotation() !== 3) return false;
        if (placement.next.getRotation() !== 3) return false;

        const dx = placement.next.getTranslateX() - placement.current.getTranslateX();
        const dy = placement.next.getTranslateY() - placement.current.getTranslateY();

        return dx === 1 && dy === 1;

    }

}