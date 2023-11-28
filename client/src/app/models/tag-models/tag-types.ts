/*
Manage the list of all existing tags
*/

import { get } from "mongoose";
import Tag from "./abstract-tag";
import OJTag from "./all-tags/oj-tag";
import SFlatTag from "./all-tags/s-flat-tag";
import KoryanLJTag from "./all-tags/koryan-lj-tag";

export const enum TagID {
    S_FLAT = "S_FLAT",
    OJ = "OJ",
    KORYAN_LJ = "KORYAN_LJ",
}


// A dictionary of TagID to Tag classes (not instances). Store keys as strings, as TS is weird with enums
export const ALL_TAGS: {[key: string]: Tag} = {
    [TagID.S_FLAT]: new SFlatTag(),
    [TagID.OJ]: new OJTag(),
    [TagID.KORYAN_LJ]: new KoryanLJTag(),
    
};

export const getTagByID = (id: TagID): Tag | undefined => {
    return ALL_TAGS[id];
}