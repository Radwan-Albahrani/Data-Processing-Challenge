// ========================= Import Modules ==============================
import { createTables, insertData } from "../common/databaseManager";

// ========================= Handle CSV ==============================
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

    // Create all tables
    try {
        console.log("Creating the table");
        await createTables();
    } catch (error) {
        console.log(error);
        return new Response(`Error creating the table: ${error}`, {
            status: 500,
        });
    }
    // Add the data to the database
    console.log("Adding the data to the database");
    try {
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
