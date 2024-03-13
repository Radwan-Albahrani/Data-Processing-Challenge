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
            const response = await handleCSV(request);
            const responseCopy = response.clone();
            console.log(request.method, request.url, responseCopy.status);
            console.log(await responseCopy.text());
            return response;
        }

        const responseJson = JSON.stringify({
            status: 404,
            message: "Not Found",
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
