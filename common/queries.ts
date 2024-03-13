// ========================= Request Table Queries =========================

export const createRequestsTableQuery = `
CREATE TABLE IF NOT EXISTS Requests (
    RequestID INTEGER PRIMARY KEY,
    RequestType INTEGER Check (RequestType IN (1, 2, 3, 4, 5)),
    RequestStatus INTEGER  Check (RequestStatus IN (1, 2, 3)),
    RequestData text Check (RequestData IN ("New License", "Account Request", "Inspection Request", "Add New Activity", "Stamp License Letter"))
    );
`;

export const insertRequestQueryString = `
INSERT INTO Requests (RequestID, RequestType, RequestStatus, RequestData)
VALUES ($requestID , $requestType, $requestStatus, $requestData);
`;

export const countAllRequestsQuery = `
SELECT COUNT(*) as Amount FROM Requests;
`;

// ========================= New License Table Queries =========================
export const createLicenseTableQuery = `
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
`;

export const insertLicenseQueryString = `
INSERT INTO NewLicense (CompanyName, LicenseType, IsOffice, OfficeName, OfficeServiceNumber, RequestDate, Activities, RequestID)
VALUES ($companyName, $licenseType, $isOffice, $officeName, $officeServiceNumber, $requestDate, $activities, $requestID);
`;

export const countAllLicensesQuery = `
SELECT COUNT(*) as Amount FROM NewLicense;
`;

// ========================= Account Table Queries =========================

export const createAccountTableQuery = `
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
`;

export const insertAccountQueryString = `
INSERT INTO AccountRequest (CompanyName, RequesterName, ApplicantName, UserName, ContactEmail, Permissions, RequestID)
VALUES ($companyName, $requesterName, $applicantName, $userName, $contactEmail, $permissions, $requestID);
`;

export const countAllAccountRequestsQuery = `
SELECT COUNT(*) as Amount FROM AccountRequest;
`;

// ========================= Inspection Table Queries =========================

// ====== Inspection Table Queries ======
export const createInspectionTableQuery = `
CREATE TABLE IF NOT EXISTS InspectionRequest (
    RequestID INTEGER,
    CompanyName TEXT,
    InspectionDate TEXT,
    InspectionTime TEXT,
    InspectionType TEXT Check (InspectionType IN ("renew", "check", "update", "new")),
    Foreign Key (RequestID) References Requests(RequestID)
    );
`;

// ====== Insert Inspection Table Queries ======

export const insertInspectionQueryString = `
INSERT INTO InspectionRequest (CompanyName, InspectionDate, InspectionTime, InspectionType, RequestID)
VALUES ($companyName, $inspectionDate, $inspectionTime, $inspectionType, $requestID);
`;

// ====== Select All Inspection Table Queries ======
export const countAllInspectionQuery = `
SELECT COUNT(*) as Amount FROM InspectionRequest;
`;

// ========================= Activity Table Queries =========================
export const createActivityTableQuery = `
CREATE TABLE IF NOT EXISTS AddNewActivity (
    RequestID INTEGER,
    CompanyName TEXT,
    LicenseID TEXT,
    Activities TEXT,
    Foreign Key (RequestID) References Requests(RequestID)
    );
`;

export const insertActivityQueryString = `
INSERT INTO AddNewActivity (CompanyName, LicenseID, Activities, RequestID)
VALUES ($companyName, $licenseID, $activities, $requestID);
`;

export const countAllActivitiesQuery = `
SELECT COUNT(*) as Amount FROM AddNewActivity;
`;

// ========================= Stamp Table Queries =========================
export const createStampLicenseLetterTableQuery = `
CREATE TABLE IF NOT EXISTS StampLicenseLetter (
    RequestID INTEGER,
    CompanyName TEXT,
    LicenseID TEXT,
    RequestDate TEXT,
    Foreign Key (RequestID) References Requests(RequestID)
    );
`;

export const insertStampQueryString = `
INSERT INTO StampLicenseLetter (CompanyName, LicenseID, RequestDate, RequestID)
VALUES ($companyName, $licenseID, $requestDate, $requestID);
`;

export const countAllStampsQuery = `
SELECT COUNT(*) as Amount FROM StampLicenseLetter;
`;
