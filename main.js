import { logger } from "log"; // Import the logger module export function
import { EdgeAuth } from "utils/edgeauth.js";
import { EdgeKV } from 'edgekv.js';
import { createResponse } from "create-response";
import URLSearchParams from 'url-search-params';

function createErrorResponse(message) {
  return createResponse(
    400,
    {'Content-Type':['application/json;charset=utf-8']},
    JSON.stringify({error: message})
  );
}

export async function responseProvider(request) {
  logger.log("Adding a header in onClientRequest");
  logger.log("The request's host is: %s", request.host);
  logger.log("The request's method is: %s", request.method);
  logger.log("The request's path is: %s", request.path);
  logger.log("The request's cpcode is: %s", request.cpCode);

  const params = new URLSearchParams(request.query);
  const partnerId = params.get('partner');

  // Respond with an error if code is not passed in.
  if(!partnerId){
    return createErrorResponse('PartnerId is mandatory');
  }

  let EA_ENCRYPTION_KEY = "";
  let EA_ENCRYPTION_DEFAULT_KEY = "b6e9bb9361116402c8e0ee6de2eb2ec6";

  const edgeKv = new EdgeKV({namespace: "tokenAuth", group: "grp1"});
  try {
    EA_ENCRYPTION_KEY = await edgeKv.getText({ item: partnerId, 
      default_value: EA_ENCRYPTION_DEFAULT_KEY });

  }catch (error) {
    return createErrorResponse(error.toString());
  }

  let token_start_time = Math.trunc(Date.now() / 1000);
  let token_validity_window = 300;
  let token_end_time = Math.trunc(Date.now() / 1000) + token_validity_window;

  //token generation
  var ea = new EdgeAuth({
    key: EA_ENCRYPTION_KEY,
    startTime: token_start_time,
    endTime: token_end_time,
    escapeEarly: false,
  });

  var acl = ["/*"];
  var token = ea.generateACLToken(acl);
  //console.log("token is " + token);

  return Promise.resolve(
    createResponse(
      200,
      { "Content-Type": ["application/json"],"Partner-Type": [partnerId],"Key":[EA_ENCRYPTION_KEY] },
      JSON.stringify(token)
    )
  );
}

//Create logs in the onClientResponse phase
export function onClientResponse(request, response) {
  // Outputs a message to the X-Akamai-EdgeWorker-onClientResponse-Log header.
  logger.log("Adding a header in onClientResponse");
  response.setHeader("EdgeworkerResponse", "Response from Edgeworkers");
}
