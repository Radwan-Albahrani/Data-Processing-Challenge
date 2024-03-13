import { Database } from "bun:sqlite";

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
            const newRequestData = requestData.replace(/""/g, "'");
            delete row.RequestData;
            return {
                ...row,
                RequestData: JSON.parse(newRequestData),
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

    // Create the table
    try {
        console.log("Creating the table");
        const query = db.query(
            `
            CREATE TABLE IF NOT EXISTS Requests (
                RequestID INTEGER PRIMARY KEY,
                RequestType INTEGER Check (RequestType IN (1, 2, 3, 4, 5)),
                RequestStatus INTEGER  Check (RequestStatus IN (1, 2, 3)),
                RequestData text
                );
        `
        );
        await query.get();
    } catch (error) {
        console.log(error);
        return new Response(`Error creating the table: ${error}`, {
            status: 500,
        });
    }
    // Add the data to the database
    console.log("Adding the data to the database");
    try {
        const query = db.prepare(
            `
            INSERT INTO Requests (RequestID, RequestType, RequestStatus, RequestData)
            VALUES ($requestID , $requestType, $requestStatus, $requestData);
        `
        );
        const insertData = db.transaction(
            (
                data: {
                    [key: string]: string;
                }[]
            ) => {
                for (const row of data) {
                    query.run({
                        $requestID: row.RequestID,
                        $requestType: row.RequestType,
                        $requestStatus: row.RequestStatus,
                        $requestData: row.RequestData,
                    });
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
