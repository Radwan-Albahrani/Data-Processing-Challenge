import {
    createTables,
    getAllData,
    insertData,
} from "../common/databaseManager";

// ========================= Get All Data ==============================
// Get all data from the database
const handleGetAllData = async () => {
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
        message: "Data Report",
        details: {
            tables: allCounts,
        },
    });
    return new Response(ResponseJson, { status: 200 });
};

export default handleGetAllData;
