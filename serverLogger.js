import fs from "fs";
import path from "path";
import { DateTime } from "luxon";

//const __filename = new URL(import.meta.url).pathname;
//const __dirname = path.dirname(__filename);

// Update the log file path
const logFolderPath = "C:/Users/Richard Marrujo/OneDrive/Desktop/Driving App/Logs";
const logFilePath = path.join(logFolderPath, "server_logs.txt");

// Create the Logs directory if it doesn't exist
fs.mkdirSync(logFolderPath, { recursive: true });

// Create the log file if it doesn't exist
fs.closeSync(fs.openSync(logFilePath, 'a'));

const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

function customLog(message) {
    const currentDate = DateTime.now().setZone("America/Chicago");
    const formattedMessage = `[${currentDate.toISO()}] ${message}`;
    console.log(formattedMessage);
    logStream.write(formattedMessage + "\n");
}

export { customLog };
