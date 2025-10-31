import { SessionsClient } from "dialogflow";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const sessionClient = new SessionsClient({
  keyFilename: join(__dirname, "dialogflow-key.json"),
});

const projectId = process.env.PROJECT_ID;

export async function detectIntent(text, sessionId) {
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode: "es" },
    },
  };

  const [response] = await sessionClient.detectIntent(request);
  return response.queryResult.fulfillmentText;
}
