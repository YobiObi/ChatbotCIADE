// backend/dialogflowService.js
import { SessionsClient } from 'dialogflow';
import { join } from 'path';

const sessionClient = new SessionsClient({
  keyFilename: join(__dirname, 'dialogflow-key.json'),
});

const projectId = 'chatbotciade';

async function detectIntent(text, sessionId) {
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode: 'es',
      },
    },
  };
  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult.fulfillmentText;
}

export default { detectIntent };
