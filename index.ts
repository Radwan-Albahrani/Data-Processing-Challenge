// imports
import { serve } from "bun";

import handleCSV from "./handlers/handleCSV";
import handleGetAllData from "./handlers/handleGetAllData";
import handleGetAllRequests from "./handlers/handleGetAllRequests";
import handleGetAllLicenses from "./handlers/handleGetAllLicenses";
import handleGetAllAccounts from "./handlers/handleGetAllAccounts";
import handleGetAllInspection from "./handlers/handleGetAllInspection";
import handleGetAllActivities from "./handlers/handleGetAllActivities";
import handleGetAllStamps from "./handlers/handleGetAllStamps";

// Define the port
const PORT = 3000;

// Start the server
const server = serve({
    port: PORT,
    async fetch(request: Request) {
        const { method } = request;
        const url = new URL(request.url);

        // ========================= Routes ==============================
        // =========== POST ==========
        // Receive a CSV file and add it to the database
        if (method === "POST" && url.pathname === "/api/upload/csv") {
            const response = await handleCSV(request);
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            console.log(await responseCopy.text());
            return response;
        }

        // =========== GET ==========
        // Get a data report from the database
        if (method === "GET" && url.pathname === "/api/report") {
            const response = await handleGetAllData();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // Get all requests from the database
        if (method === "GET" && url.pathname === "/api/select/requests") {
            const response = await handleGetAllRequests();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // Get all licenses from the database
        if (method === "GET" && url.pathname === "/api/select/licenses") {
            const response = await handleGetAllLicenses();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // Get all accounts from the database
        if (method === "GET" && url.pathname === "/api/select/accounts") {
            const response = await handleGetAllAccounts();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // Get all inspections from the database
        if (method === "GET" && url.pathname === "/api/select/inspections") {
            const response = await handleGetAllInspection();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // Get All Activities from the database
        if (method === "GET" && url.pathname === "/api/select/activities") {
            const response = await handleGetAllActivities();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // Get All Stamps from the database
        if (method === "GET" && url.pathname === "/api/select/stamps") {
            const response = await handleGetAllStamps();
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            return response;
        }

        // =========== 404 ==========
        const responseJson = JSON.stringify({
            status: 404,
            message: "Not Found",
            details: "The route you are trying to access does not exist",
        });
        return new Response(responseJson, { status: 404 });
    },
    error(error) {
        return new Response(`<pre>${error}\n${error.stack}</pre>`, {
            headers: {
                "Content-Type": "text/html",
            },
        });
    },
});

// Export the server
export default server;
