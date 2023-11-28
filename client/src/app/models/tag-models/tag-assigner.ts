/*
Class in assigning a placement one or more tags, like "T-Spin" or "S flat"
*/

import MoveableTetromino from "../game-models/moveable-tetromino";
import BinaryGrid from "../tetronimo-models/binary-grid";
import Tag from "./abstract-tag";
import { ALL_TAGS, TagID, getTagByID } from "./tag-types";

// a struct for a placement that has enough info for tags to determine if they apply
export class SimplePlacement {
    constructor(
        public readonly board: BinaryGrid,
        public readonly current: MoveableTetromino,
        public readonly next: MoveableTetromino
    ) {}
}

export default class TagAssigner {
    
    // given a board and piece placements, return a list of tag IDs that apply
    public static assignTagsFor(placement: SimplePlacement): TagID[] {

        const tags: TagID[] = [];

        // for each tag, temporarily construct an instance and call identify()
        for (let tagIDString in ALL_TAGS) {
            const tagID = tagIDString as TagID;
            const tag = getTagByID(tagID)!;

            if (tag.identify(placement)) {
                tags.push(tagID);
            }
        }

        return tags;
    }

}