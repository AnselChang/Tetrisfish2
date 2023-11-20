import mongoose, { Schema } from "mongoose";

// Schema for a played game.
// Since this will be a large database, we use value (attribute name) optimization
// although list of accuracies for placements is sent to server, it's only needed for 10k placements and not stored in db
const gameSchema = new Schema({
    ts : { // timestamp
        type: Date,
        required: true,
    },
    uid : { // discordID
        type: String,
        required: true,
        index: true,
    },
    gid: { // gameID
        type: String,
        required: true,
        index: true,
    },
    pm : { // list of serialized placements
        type: Schema.Types.Mixed,
        required: true,
    },
    sl : { // start level
        type: Number,
        required: true,
    },
    is : { // input speed
        type: Number,
        required: true,
    },
    ps : { // playstyle
        type: String,
        required: true,
    },
    lb : { // eligible for leaderboard
        type: Boolean,
        required: true,
    },
    s19 : { // score at transition to 19
        type: Number,
        required: false,
    },
    s29 : { // score at transition to 29
        type: Number,
        required: false,
    },
    fs : { // final score
        type: Number,
        required: true,
    },
    fle : { // final level
        type: Number,
        required: true,
    },
    fli : { // final lines
        type: Number,
        required: true,
    },
    trt : { // tetris rate
        type: Number,
        required: true,
    },
    dro : { // drought percent
        type: Number,
        required: true,
    },
    trd : { // tetris readiness
        type: Number,
        required: true,
    },
    ipe : { // i piece efficiency
        type: Number,
        required: true,
    },
    adj : { // num missed adjustments
        type: Number,
        required: true,
    },
    aAll: { // overall accuracy
        type: Number,
        required: true,
    },
    a18: { // accuracy at 18
        type: Number,
        required: false,
    },
    a19: { // accuracy at 19
        type: Number,
        required: false,
    },
    a29: { // accuracy at 29
        type: Number,
        required: false,
    },
    aI: { // accuracy for i piece
        type: Number,
        required: false,
    },
    aJ: { // accuracy for j piece
        type: Number,
        required: false,
    },
    aL: { // accuracy for l piece
        type: Number,
        required: false,
    },
    aO: { // accuracy for o piece
        type: Number,
        required: false,
    },
    aS: { // accuracy for s piece
        type: Number,
        required: false,
    },
    aT: { // accuracy for t piece
        type: Number,
        required: false,
    },
    aZ: { // accuracy for z piece
        type: Number,
        required: false,
    },
});

const DBGame = mongoose.model('DBGame', gameSchema);
export default DBGame;