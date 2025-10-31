// backend/dialogflowService.js
import pkg from "dialogflow";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const { SessionsClient } = pkg;

const __dirname = dirname(fileURLToPath(import.meta.url));

const sessionClient = new SessionsClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  projectId: process.env.PROJECT_ID,
});

export async function detectIntent(text, sessionId) {
  const sessionPath = sessionClient.sessionPath(process.env.PROJECT_ID, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode: "es" },
    },
  };

  const [response] = await sessionClient.detectIntent(request);
  return response.queryResult.fulfillmentText;
}

export default { detectIntent };
