import { Database } from "bun:sqlite";

import type {
    NewLicenseModel,
    AccountRequestModel,
    InspectionRequestModel,
    NewActivityModel,
    StampLicenseModel,
} from "../models";

import {
    insertRequestQueryString,
    insertLicenseQueryString,
    insertAccountQueryString,
    insertInspectionQueryString,
    insertActivityQueryString,
    insertStampQueryString,
    createRequestsTableQuery,
    createLicenseTableQuery,
    createAccountTableQuery,
    createInspectionTableQuery,
    createActivityTableQuery,
    createStampLicenseLetterTableQuery,
    countAllRequestsQuery,
    countAllLicensesQuery,
    countAllAccountRequestsQuery,
    countAllInspectionQuery,
    countAllActivitiesQuery,
    countAllStampsQuery,
} from "./queries";

export const insertData = async (
    data: {
        [key: string]: string;
    }[]
) => {
    // Connect to the database
    const db = new Database("data/data.sqlite");
    const insertRequestQuery = db.prepare(insertRequestQueryString);

    const insertRequestLicenseQuery = db.prepare(insertLicenseQueryString);

    const insertAccountRequestQuery = db.prepare(insertAccountQueryString);

    const insertInspectionRequestQuery = db.prepare(
        insertInspectionQueryString
    );

    const insertAddNewActivityQuery = db.prepare(insertActivityQueryString);

    const insertStampLicenseLetterQuery = db.prepare(insertStampQueryString);
    const insertDataTransaction = db.transaction(
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

    await insertDataTransaction(data);

    // close the database
    db.close();
};
export const createTables = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");
    const requestsTable = db.prepare(createRequestsTableQuery);

    const newLicenseTable = db.prepare(createLicenseTableQuery);

    const accountRequestTable = db.prepare(createAccountTableQuery);

    const inspectionRequestTable = db.prepare(createInspectionTableQuery);

    const addNewActivityTable = db.prepare(createActivityTableQuery);

    const stampLicenseLetterTable = db.prepare(
        createStampLicenseLetterTableQuery
    );

    const tableTransaction = db.transaction(() => {
        requestsTable.run();
        newLicenseTable.run();
        accountRequestTable.run();
        inspectionRequestTable.run();
        addNewActivityTable.run();
        stampLicenseLetterTable.run();
    });

    await tableTransaction();

    // close the database
    db.close();
};

export const getAllData = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");
    const requestsTable = db.prepare(countAllRequestsQuery);
    const licensesTable = db.prepare(countAllLicensesQuery);
    const accountsTable = db.prepare(countAllAccountRequestsQuery);
    const inspectionTable = db.prepare(countAllInspectionQuery);
    const activityTable = db.prepare(countAllActivitiesQuery);
    const stampTable = db.prepare(countAllStampsQuery);
    const runAll = db.transaction(() => {
        const requests = requestsTable.all();
        const licenses = licensesTable.all();
        const accounts = accountsTable.all();
        const inspections = inspectionTable.all();
        const activities = activityTable.all();
        const stamps = stampTable.all();
        return {
            allRequests: requests,
            licenses: licenses,
            accounts: accounts,
            inspections: inspections,
            activities: activities,
            stamps: stamps,
        };
    });

    let result;
    try {
        result = await runAll();
    } catch (error) {
        console.log(error);
        throw error;
    }

    db.close();
    return result;
};
