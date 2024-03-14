import { getAllStamps } from "../common/databaseManager";

// ========================= Get All Data ==============================
// Get all data from the database
const handleGetAllStamps = async () => {
    let allCounts;
    try {
        allCounts = await getAllStamps();
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
        count: allCounts.length,
        details: {
            data: allCounts,
        },
    });
    return new Response(ResponseJson, { status: 200 });
};

export default handleGetAllStamps;
