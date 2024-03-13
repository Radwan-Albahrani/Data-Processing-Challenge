import { Database } from "bun:sqlite";
import type { NewLicenseModel } from "../models/newLicenseModel";
import type { AccountRequestModel } from "../models/accountRequestModel";
import type { InspectionRequestModel } from "../models/inspectionRequestModel";
import type { NewActivityModel } from "../models/newActivityModel";
import type { StampLicenseModel } from "../models/stampLicenseModel";

// Handle the CSV file
const handleCSV = async (req: Request) => {
    // Get the request body
    const csv = await req.text();
    let data: { [key: string]: string }[] = [];
    console.log("Received a CSV file");

    // Parse the CSV
    try {
        const lines = csv.split("\n");
        const headers = lines[0].split(",");
        data = lines.slice(1).map((line) => {
            const values = line.split(",");
            return headers.reduce(
                (acc: { [key: string]: string }, header, i) => {
                    if (header !== "RequestData") {
                        acc[header] = values[i];
                    } else {
                        acc[header] = values.slice(i).join(",");
                    }
                    return acc;
                },
                {}
            );
        });
    } catch (error) {
        console.log(error);
        return new Response(`Error parsing the CSV: ${error}`, { status: 500 });
    }

    // Make sure the last column is a proper JSON object
    let newData: { [key: string]: string }[] = [];

    // Parse the RequestData field
    try {
        newData = data.map((row) => {
            const requestData = row.RequestData;
            const newRequestData = requestData.replace(/"/g, "'");
            const newRequestData2 = newRequestData.replace(/''/g, '"');
            const newRequestData3 = newRequestData2.replace(/'/g, "");
            delete row.RequestData;
            return {
                ...row,
                RequestData: JSON.parse(newRequestData3),
            };
        });
    } catch (error) {
        console.log(error);
        return new Response(
            `Error parsing the RequestData Field of the CSV: ${error}`,
            {
                status: 500,
            }
        );
    }

    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Create all tables
    try {
        console.log("Creating the table");
        const requestsTable = db.prepare(
            `
            CREATE TABLE IF NOT EXISTS Requests (
                RequestID INTEGER PRIMARY KEY,
                RequestType INTEGER Check (RequestType IN (1, 2, 3, 4, 5)),
                RequestStatus INTEGER  Check (RequestStatus IN (1, 2, 3)),
                RequestData text Check (RequestData IN ("New License", "Account Request", "Inspection Request", "Add New Activity", "Stamp License Letter"))
                );
        `
        );

        const newLicenseTable = db.prepare(
            `
            CREATE TABLE IF NOT EXISTS NewLicense (
                RequestID INTEGER,
                CompanyName TEXT,
                LicenseType TEXT Check (LicenseType IN ("Proprietor", "Commercial", "Personal")),
                IsOffice BOOLEAN,
                OfficeName TEXT,
                OfficeServiceNumber TEXT,
                RequestDate TEXT,
                Activities TEXT,
                Foreign Key (RequestID) References Requests(RequestID)
                );
        `
        );

        const accountRequestTable = db.prepare(
            `
            CREATE TABLE IF NOT EXISTS AccountRequest (
                RequestID INTEGER,
                CompanyName TEXT,
                RequesterName TEXT,
                ApplicantName TEXT,
                UserName TEXT,
                ContactEmail TEXT,
                Permissions TEXT,
                Foreign Key (RequestID) References Requests(RequestID)
                );
        `
        );

        const inspectionRequestTable = db.prepare(
            `
            CREATE TABLE IF NOT EXISTS InspectionRequest (
                RequestID INTEGER,
                CompanyName TEXT,
                InspectionDate TEXT,
                InspectionTime TEXT,
                InspectionType TEXT Check (InspectionType IN ("renew", "check", "update", "new")),
                Foreign Key (RequestID) References Requests(RequestID)
                );
        `
        );

        const addNewActivityTable = db.prepare(
            `
            CREATE TABLE IF NOT EXISTS AddNewActivity (
                RequestID INTEGER,
                CompanyName TEXT,
                LicenseID TEXT,
                Activities TEXT,
                Foreign Key (RequestID) References Requests(RequestID)
                );
        `
        );

        const stampLicenseLetterTable = db.prepare(
            `
            CREATE TABLE IF NOT EXISTS StampLicenseLetter (
                RequestID INTEGER,
                CompanyName TEXT,
                LicenseID TEXT,
                RequestDate TEXT,
                Foreign Key (RequestID) References Requests(RequestID)
                );
        `
        );

        const runTransaction = db.transaction(() => {
            requestsTable.run();
            newLicenseTable.run();
            accountRequestTable.run();
            inspectionRequestTable.run();
            addNewActivityTable.run();
            stampLicenseLetterTable.run();
        });

        await runTransaction();
    } catch (error) {
        console.log(error);
        return new Response(`Error creating the table: ${error}`, {
            status: 500,
        });
    }
    // Add the data to the database
    console.log("Adding the data to the database");
    try {
        const insertRequestQuery = db.prepare(
            `
            INSERT INTO Requests (RequestID, RequestType, RequestStatus, RequestData)
            VALUES ($requestID , $requestType, $requestStatus, $requestData);
        `
        );

        const insertRequestLicenseQuery = db.prepare(
            `
            INSERT INTO NewLicense (CompanyName, LicenseType, IsOffice, OfficeName, OfficeServiceNumber, RequestDate, Activities, RequestID)
            VALUES ($companyName, $licenseType, $isOffice, $officeName, $officeServiceNumber, $requestDate, $activities, $requestID);
        `
        );

        const insertAccountRequestQuery = db.prepare(
            `
            INSERT INTO AccountRequest (CompanyName, RequesterName, ApplicantName, UserName, ContactEmail, Permissions, RequestID)
            VALUES ($companyName, $requesterName, $applicantName, $userName, $contactEmail, $permissions, $requestID);
        `
        );

        const insertInspectionRequestQuery = db.prepare(
            `
            INSERT INTO InspectionRequest (CompanyName, InspectionDate, InspectionTime, InspectionType, RequestID)
            VALUES ($companyName, $inspectionDate, $inspectionTime, $inspectionType, $requestID);
        `
        );

        const insertAddNewActivityQuery = db.prepare(
            `
            INSERT INTO AddNewActivity (CompanyName, LicenseID, Activities, RequestID)
            VALUES ($companyName, $licenseID, $activities, $requestID);
        `
        );

        const insertStampLicenseLetterQuery = db.prepare(
            `
            INSERT INTO StampLicenseLetter (CompanyName, LicenseID, RequestDate, RequestID)
            VALUES ($companyName, $licenseID, $requestDate, $requestID);
        `
        );
        const insertData = db.transaction(
            (
                data: {
                    [key: string]: string;
                }[]
            ) => {
                for (const row of data) {
                    let requestData = "";
                    if (row.RequestType === "1") {
                        requestData = "New License";
                    } else if (row.RequestType === "2") {
                        requestData = "Account Request";
                    } else if (row.RequestType === "3") {
                        requestData = "Inspection Request";
                    } else if (row.RequestType === "4") {
                        requestData = "Add New Activity";
                    } else if (row.RequestType === "5") {
                        requestData = "Stamp License Letter";
                    }
                    insertRequestQuery.run({
                        $requestID: row.RequestID,
                        $requestType: row.RequestType,
                        $requestStatus: row.RequestStatus,
                        $requestData: requestData,
                    });
                    if (row.RequestType === "1") {
                        const licenseRequest: NewLicenseModel = JSON.parse(
                            JSON.stringify(row.RequestData)
                        );
                        insertRequestLicenseQuery.run({
                            $companyName: licenseRequest.CompanyName,
                            $licenseType: licenseRequest.LicenceType,
                            $isOffice: licenseRequest.IsOffice,
                            $officeName: licenseRequest.OfficeName,
                            $officeServiceNumber:
                                licenseRequest.OfficeServiceNumber,
                            $requestDate: licenseRequest.RequestDate,
                            $activities: licenseRequest.Activities,
                            $requestID: row.RequestID,
                        });
                    } else if (row.RequestType === "2") {
                        const accountRequest: AccountRequestModel = JSON.parse(
                            JSON.stringify(row.RequestData)
                        );
                        insertAccountRequestQuery.run({
                            $companyName: accountRequest.CompanyName,
                            $requesterName: accountRequest.RequesterName,
                            $applicantName: accountRequest.ApplicantName,
                            $userName: accountRequest.UserName,
                            $contactEmail: accountRequest.ContactEmail,
                            $permissions: accountRequest.Permissions.toString(),
                            $requestID: row.RequestID,
                        });
                    } else if (row.RequestType === "3") {
                        const inspectionRequest: InspectionRequestModel =
                            JSON.parse(JSON.stringify(row.RequestData));
                        insertInspectionRequestQuery.run({
                            $companyName: inspectionRequest.CompanyName,
                            $inspectionDate: inspectionRequest.InspectionDate,
                            $inspectionTime: inspectionRequest.InspectionTime,
                            $inspectionType: inspectionRequest.InspectionType,
                            $requestID: row.RequestID,
                        });
                    } else if (row.RequestType === "4") {
                        const activityRequest: NewActivityModel = JSON.parse(
                            JSON.stringify(row.RequestData)
                        );
                        insertAddNewActivityQuery.run({
                            $companyName: activityRequest.CompanyName,
                            $licenseID: activityRequest.LicenceID,
                            $activities: activityRequest.Activities.toString(),
                            $requestID: row.RequestID,
                        });
                    } else if (row.RequestType === "5") {
                        const stampRequest: StampLicenseModel = JSON.parse(
                            JSON.stringify(row.RequestData)
                        );
                        insertStampLicenseLetterQuery.run({
                            $companyName: stampRequest.CompanyName,
                            $licenseID: stampRequest.LicenceID,
                            $requestDate: stampRequest.RequestDate,
                            $requestID: row.RequestID,
                        });
                    }
                }
            }
        );
        insertData(newData);
    } catch (error) {
        console.log(error);
        return new Response(`Error adding the data to the database: ${error}`, {
            status: 500,
        });
    }

    return new Response("Data Imported Successfully", { status: 200 });
};

export default handleCSV;
