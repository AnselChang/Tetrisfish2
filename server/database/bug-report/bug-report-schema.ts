import mongoose, { Schema } from "mongoose";

// custom uuid-generated id, and json for the bug report
const bugReportSchema = new Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
      },
    data: {
        type: Schema.Types.Mixed,
        default: {}
    }
});

const DBBugReport = mongoose.model('DBBugReport', bugReportSchema);
export default DBBugReport;