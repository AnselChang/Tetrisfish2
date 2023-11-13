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
        return true;
    }

}