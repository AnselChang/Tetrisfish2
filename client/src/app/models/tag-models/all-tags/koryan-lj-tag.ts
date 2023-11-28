import MoveableTetromino from "../../game-models/moveable-tetromino";
import { TetrominoType } from "../../tetronimo-models/tetromino";
import Tag, {TagExample } from "../abstract-tag";
import { SimplePlacement } from "../tag-assigner";
import { TagID } from "../tag-types";

export default class KoryanLJTag extends Tag {

    constructor() {
        super(
            TagID.KORYAN_LJ, "koryan-lj", "Koryan (LJ)",
            "Description here",
            new TagExample(
                "",
                new MoveableTetromino(TetrominoType.L_TYPE, 0, 0, 0),
                new MoveableTetromino(TetrominoType.J_TYPE, 0, 0, 0)
            )
        );
    }

    public override identify(placement: SimplePlacement): boolean {

        /* example:
        L r=1, x=4, y=17
        J r=3, x=6, y=17
        */

        if (!(
            (placement.current.tetrominoType === TetrominoType.L_TYPE && placement.next.tetrominoType === TetrominoType.J_TYPE)
            ||
            (placement.current.tetrominoType === TetrominoType.J_TYPE && placement.next.tetrominoType === TetrominoType.L_TYPE)
            )
        ) return false;

        const lPiece = placement.current.tetrominoType === TetrominoType.L_TYPE ? placement.current : placement.next;
        const jPiece = placement.current.tetrominoType === TetrominoType.J_TYPE ? placement.current : placement.next;

        if (lPiece.getRotation() !== 1) return false;
        if (jPiece.getRotation() !== 3) return false;

        if (lPiece.getTranslateY() !== jPiece.getTranslateY()) return false;
        return jPiece.getTranslateX() - lPiece.getTranslateX() === 2;

    }

}