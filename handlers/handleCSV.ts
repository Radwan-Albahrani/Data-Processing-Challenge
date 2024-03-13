import { Database } from "bun:sqlite";
import type {
    AccountRequestModel,
    InspectionRequestModel,
    NewActivityModel,
    NewLicenseModel,
    StampLicenseModel,
} from "../models/index";
import {
    accountTableQuery,
    activityTableQuery,
    insertAccountQueryString,
    insertActivityQueryString,
    insertInspectionQueryString,
    insertLicenseQueryString,
    insertRequestQueryString,
    insertStampQueryString,
    inspectionTableQuery,
    licenseTableQuery,
    requestsQuery,
    stampTableQuery,
} from "../common/queries";
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
        const requestsTable = db.prepare(requestsQuery);

        const newLicenseTable = db.prepare(licenseTableQuery);

        const accountRequestTable = db.prepare(accountTableQuery);

        const inspectionRequestTable = db.prepare(inspectionTableQuery);

        const addNewActivityTable = db.prepare(activityTableQuery);

        const stampLicenseLetterTable = db.prepare(stampTableQuery);

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
        const insertRequestQuery = db.prepare(insertRequestQueryString);

        const insertRequestLicenseQuery = db.prepare(insertLicenseQueryString);

        const insertAccountRequestQuery = db.prepare(insertAccountQueryString);

        const insertInspectionRequestQuery = db.prepare(
            insertInspectionQueryString
        );

        const insertAddNewActivityQuery = db.prepare(insertActivityQueryString);

        const insertStampLicenseLetterQuery = db.prepare(
            insertStampQueryString
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
