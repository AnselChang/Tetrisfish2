import DBBugReport from "./bug-report-schema";
import { v4 as uuidv4 } from 'uuid';

// adds a new bug report to the database and returns the id
export async function addBugReport(data: any) {
    const bugReport = new DBBugReport({
        id: uuidv4(),
        data: data
    });
    await bugReport.save();
    return bugReport.id;
}

export async function getBugReport(id: string) {
    const bugReport = await DBBugReport.findOne({id: id});
    return bugReport;
}