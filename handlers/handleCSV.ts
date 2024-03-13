// ========================= Import Modules ==============================
import {
    createTables,
    getAllData,
    insertData,
} from "../common/databaseManager";

// ========================= Handle CSV ==============================
// Handle the CSV file
const handleCSV = async (req: Request) => {
    // Get the request csv file
    const formData = await req.formData();
    const csvBlob = await formData.get("csv");
    let csv = "";
    if (csvBlob) {
        if (typeof csvBlob !== "string" && csvBlob.type !== "text/csv") {
            const ResponseJson = JSON.stringify({
                status: 400,
                message: "Invalid File Type",
            });
            return new Response(ResponseJson, { status: 400 });
        }
        if (typeof csvBlob !== "string" && csvBlob.type === "text/csv") {
            csv = await csvBlob.text();
        }
    }
    let data: { [key: string]: string }[] = [];
    // Parse the CSV
    try {
        csv = csv.replaceAll("\r\n", "\n");
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
        const ResponseJson = JSON.stringify({
            status: 500,
            error: error,
            message: "Error parsing the CSV",
        });
        return new Response(ResponseJson, { status: 500 });
    }

    // Make sure the last column is a proper JSON object
    let newData: { [key: string]: string }[] = [];
    // Parse the RequestData field
    try {
        newData = data.map((row) => {
            let requestData = row.RequestData;
            requestData = requestData.slice(1, -1);
            requestData = requestData.replace(/""/g, '"');
            delete row.RequestData;
            return {
                ...row,
                RequestData: JSON.parse(requestData),
            };
        });
    } catch (error) {
        const ResponseJson = JSON.stringify({
            status: 500,
            error: error,
            message: "Error parsing the RequestData field",
        });
        return new Response(ResponseJson, {
            status: 500,
        });
    }

    // Create all tables
    try {
        await createTables();
    } catch (error) {
        const ResponseJson = JSON.stringify({
            status: 500,
            error: error,
            message: "Error creating the table",
        });
        return new Response(ResponseJson, {
            status: 500,
        });
    }
    // Add the data to the database

    try {
        await insertData(newData);
    } catch (error: any) {
        let details = "";
        if (error.code.includes("SQLITE_CONSTRAINT")) {
            details = "Duplicate Entry";
        }
        const ResponseJson = JSON.stringify({
            status: 500,
            error: error,
            message: `Error inserting the data: ${details}`,
        });
        return new Response(ResponseJson, { status: 500 });
    }
    let allCounts;
    try {
        allCounts = await getAllData();
    } catch (error) {
        const ResponseJson = JSON.stringify({
            status: 500,
            error: error,
            message: "Error getting the data",
        });
        return new Response(ResponseJson, { status: 500 });
    }
    const ResponseJson = JSON.stringify({
        status: 200,
        message: "Data Imported Successfully",
        details: {
            tablesUpdated: allCounts,
        },
    });
    return new Response(ResponseJson, { status: 200 });
};

export default handleCSV;
