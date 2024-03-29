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
    selectAllRequestsQuery,
    selectAllLicensesQuery,
    selectAllAccountRequestsQuery,
    selectAllInspectionQuery,
    selectAllActivitiesQuery,
    selectAllStampsQuery,
} from "./queries";

// ========================== Inserting Data ==========================
export const insertData = async (
    data: {
        [key: string]: string;
    }[]
) => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any insert statements
    const insertRequestQuery = db.prepare(insertRequestQueryString);
    const insertRequestLicenseQuery = db.prepare(insertLicenseQueryString);
    const insertAccountRequestQuery = db.prepare(insertAccountQueryString);
    const insertInspectionRequestQuery = db.prepare(
        insertInspectionQueryString
    );
    const insertAddNewActivityQuery = db.prepare(insertActivityQueryString);
    const insertStampLicenseLetterQuery = db.prepare(insertStampQueryString);

    // ================= Start a transaction =================
    const insertDataTransaction = db.transaction(
        (
            data: {
                [key: string]: string;
            }[]
        ) => {
            // ================= Insert the data =================
            // for each row, determine the request type
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

                if (isEmpty(row.RequestData)) {
                    db.close();
                    throw new Error("Request Data is empty");
                }

                // Insert basic request information in the requests table
                insertRequestQuery.run({
                    $requestID: row.RequestID,
                    $requestType: row.RequestType,
                    $requestStatus: row.RequestStatus,
                    $requestData: requestData,
                });

                // Insert the request data in the appropriate table
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

    // Run the transaction
    await insertDataTransaction(data);

    // close the database
    db.close();
};

// ========================== Check if any attribute is empty ==========================
function isEmpty(obj: any) {
    for (let key in obj) {
        if (obj[key] === "" || obj[key] === undefined || obj[key] === null)
            return true;
    }
    return false;
}

// ========================== Creating Tables ==========================
export const createTables = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any table creation statements
    const requestsTable = db.prepare(createRequestsTableQuery);
    const newLicenseTable = db.prepare(createLicenseTableQuery);
    const accountRequestTable = db.prepare(createAccountTableQuery);
    const inspectionRequestTable = db.prepare(createInspectionTableQuery);
    const addNewActivityTable = db.prepare(createActivityTableQuery);
    const stampLicenseLetterTable = db.prepare(
        createStampLicenseLetterTableQuery
    );

    // Start a transaction
    const tableTransaction = db.transaction(() => {
        requestsTable.run();
        newLicenseTable.run();
        accountRequestTable.run();
        inspectionRequestTable.run();
        addNewActivityTable.run();
        stampLicenseLetterTable.run();
    });

    // Run the transaction
    await tableTransaction();

    // close the database
    db.close();
};

// ========================== Get All Data ==============================
export const getAllData = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const requestsTable = db.prepare(countAllRequestsQuery);
    const licensesTable = db.prepare(countAllLicensesQuery);
    const accountsTable = db.prepare(countAllAccountRequestsQuery);
    const inspectionTable = db.prepare(countAllInspectionQuery);
    const activityTable = db.prepare(countAllActivitiesQuery);
    const stampTable = db.prepare(countAllStampsQuery);

    // Start a transaction
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

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};

// ========================== Get All Requests ==============================
export const getAllRequests = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const requestsTable = db.prepare(selectAllRequestsQuery);

    // Start a transaction
    const runAll = db.transaction(() => {
        const requests = requestsTable.all();
        return requests;
    });

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};

// ========================== Get All Licenses ==============================
export const getAllLicenses = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const licensesTable = db.prepare(selectAllLicensesQuery);

    // Start a transaction
    const runAll = db.transaction(() => {
        const licenses = licensesTable.all();
        return licenses;
    });

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};

// ========================== Get All Account Requests ==============================
export const getAllAccountRequests = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const accountRequestsTable = db.prepare(selectAllAccountRequestsQuery);

    // Start a transaction
    const runAll = db.transaction(() => {
        const accountRequests = accountRequestsTable.all();
        return accountRequests;
    });

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};

// ========================== Get All Inspection Requests ==============================
export const getAllInspectionRequests = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const inspectionRequestsTable = db.prepare(selectAllInspectionQuery);

    // Start a transaction
    const runAll = db.transaction(() => {
        const inspectionRequests = inspectionRequestsTable.all();
        return inspectionRequests;
    });

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};

// ========================== Get All Activities ==============================
export const getAllActivities = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const activitiesTable = db.prepare(selectAllActivitiesQuery);

    // Start a transaction
    const runAll = db.transaction(() => {
        const activities = activitiesTable.all();
        return activities;
    });

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};

// ========================== Get All Stamps ==============================
export const getAllStamps = async () => {
    // Connect to the database
    const db = new Database("data/data.sqlite");

    // Prepare any count statements
    const stampsTable = db.prepare(selectAllStampsQuery);

    // Start a transaction
    const runAll = db.transaction(() => {
        const stamps = stampsTable.all();
        return stamps;
    });

    // Run the transaction. If an error occurs, close the database and throw the error
    let result;
    try {
        result = await runAll();
    } catch (error) {
        db.close();
        throw error;
    }

    // close the database
    db.close();

    // return the result
    return result;
};
