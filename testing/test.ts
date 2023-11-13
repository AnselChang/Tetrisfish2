import MoveableTetromino from "client/src/app/models/game-models/moveable-tetromino";
import TagAssigner, { SimplePlacement } from "client/src/app/models/tag-models/tag-assigner";
import BinaryGrid from "client/src/app/models/tetronimo-models/binary-grid";
import { TetrominoType } from "client/src/app/models/tetronimo-models/tetromino";

const placement = new SimplePlacement(
    new BinaryGrid(),
    new MoveableTetromino(TetrominoType.T_TYPE, 0, 0, 0),
    new MoveableTetromino(TetrominoType.T_TYPE, 0, 0, 0),
);

const tags = TagAssigner.assignTagsFor(placement);
console.log(tags);