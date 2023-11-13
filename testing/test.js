"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moveable_tetromino_1 = require("client/src/app/models/game-models/moveable-tetromino");
var tag_assigner_1 = require("client/src/app/models/tag-models/tag-assigner");
var binary_grid_1 = require("client/src/app/models/tetronimo-models/binary-grid");
var tetromino_1 = require("client/src/app/models/tetronimo-models/tetromino");
var placement = new tag_assigner_1.SimplePlacement(new binary_grid_1.default(), new moveable_tetromino_1.default(tetromino_1.TetrominoType.T_TYPE, 0, 0, 0), new moveable_tetromino_1.default(tetromino_1.TetrominoType.T_TYPE, 0, 0, 0));
var tags = tag_assigner_1.default.assignTagsFor(placement);
console.log(tags);
