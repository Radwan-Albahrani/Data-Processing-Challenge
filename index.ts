// imports
import { serve } from "bun";

import handleCSV from "./handlers/handleCSV";

// Define the port
const PORT = 3000;

// Start the server
const server = serve({
    port: PORT,
    async fetch(request: Request) {
        const { method } = request;
        const url = new URL(request.url);

        // Receive a CSV file and add it to the database
        if (method === "POST" && url.pathname === "/upload/csv") {
            return handleCSV(request);
        }

        return new Response("Not Found", { status: 404 });
    },
});

// Export the server
export default server;
