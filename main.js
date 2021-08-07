import { logger } from "log"; // Import the logger module export function
import { EdgeAuth } from "edgeauth.js";
import { httpRequest } from "http-request";
import { createResponse } from "create-response";

export function responseProvider(request) {
  logger.log("Adding a header in onClientRequest");
  logger.log("The request's host is: %s", request.host);
  logger.log("The request's method is: %s", request.method);
  logger.log("The request's path is: %s", request.path);
  logger.log("The request's cpcode is: %s", request.cpCode);

  //var EA_HOSTNAME = 'edgeauth.akamaized.net'
  let EA_ENCRYPTION_KEY = "b6e9bb9361116402c8e0ee6de2eb2ec6";
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
  console.log("token is " + token);

  return Promise.resolve(
    createResponse(
      200,
      { "Content-Type": ["application/json"] },
      JSON.stringify(token)
    )
  );
}

//Create logs in the onClientResponse phase
export function onClientResponse(request, response) {
  // Outputs a message to the X-Akamai-EdgeWorker-onClientResponse-Log header.
  logger.log("Adding a header in onClientResponse");
  response.setHeader("EdgeworkerResponse", "Response from Edgeworkers sharao");
}
