import DBBugReport, { BugReport } from "./bug-report-schema";

// adds a new bug report to the database and returns the id
export async function addBugReport(gameID: string, data: any) {
    const bugReport = new DBBugReport({
        id: gameID,
        data: data
    });
    await bugReport.save();
}

export async function doesBugReportExist(id: string): Promise<boolean> {
    const count = await DBBugReport.countDocuments({id: id});
    return count > 0;
}

export async function getBugReport(id: string): Promise<BugReport | undefined> {
    const bugReport = await DBBugReport.findOne({id: id});
    if (!bugReport) {
        console.error("Bug report not found:", id);
        return undefined;
    }
    return bugReport;
}