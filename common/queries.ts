// ========================= Request Table Queries =========================

export const requestsQuery = `
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

// ========================= New License Table Queries =========================
export const licenseTableQuery = `
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

// ========================= Account Table Queries =========================

export const accountTableQuery = `
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

// ========================= Inspection Table Queries =========================
export const inspectionTableQuery = `
CREATE TABLE IF NOT EXISTS InspectionRequest (
    RequestID INTEGER,
    CompanyName TEXT,
    InspectionDate TEXT,
    InspectionTime TEXT,
    InspectionType TEXT Check (InspectionType IN ("renew", "check", "update", "new")),
    Foreign Key (RequestID) References Requests(RequestID)
    );
`;

export const insertInspectionQueryString = `
INSERT INTO InspectionRequest (CompanyName, InspectionDate, InspectionTime, InspectionType, RequestID)
VALUES ($companyName, $inspectionDate, $inspectionTime, $inspectionType, $requestID);
`;

// ========================= Activity Table Queries =========================
export const activityTableQuery = `
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

// ========================= Stamp Table Queries =========================
export const stampTableQuery = `
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
