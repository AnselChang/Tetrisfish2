/*
Manage the list of all existing tags
*/

import Tag from "./abstract-tag";
import OJTag from "./all-tags/oj-tag";
import SFlatTag from "./all-tags/s-flat-tag";

export const enum TagID {
    S_FLAT = "S_FLAT",
    OJ = "OJ",
}


// A dictionary of TagID to Tag classes (not instances). Store keys as strings, as TS is weird with enums
// don't actually create instances as that's a waste of memory. Instead, create instances when needed
export const ALL_TAGS: {[key: string]: typeof Tag} = {
    [TagID.S_FLAT]: SFlatTag,
    [TagID.OJ]: OJTag,
};