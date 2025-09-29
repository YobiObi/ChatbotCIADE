// backend/dialogflowService.js
const dialogflow = require('dialogflow');
const path = require('path');

const sessionClient = new dialogflow.SessionsClient({
  keyFilename: path.join(__dirname, 'dialogflow-key.json'),
});

const projectId = 'tu-proyecto-id';

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

module.exports = { detectIntent };
