/*
Class in assigning a placement one or more tags, like "T-Spin" or "S flat"
*/

import MoveableTetromino from "../game-models/moveable-tetromino";
import BinaryGrid from "../tetronimo-models/binary-grid";
import Tag from "./abstract-tag";
import { ALL_TAGS, TagID } from "./tag-types";

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

             // unfortunately, have to bypass the TS type system as TS doesn't
             // allow us to instantiate classes that were possibly abstract
            const tagClass = ALL_TAGS[tagID] as any;
            const tag = new tagClass() as Tag;

            if (tag.identify(placement)) {
                tags.push(tagID);
            }
        }

        return tags;
    }

}