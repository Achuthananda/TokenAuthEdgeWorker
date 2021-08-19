import { logger } from "log"; // Import the logger module export function
import { EdgeAuth } from "utils/edgeauth.js";
import { EdgeKV } from "edgekv.js";
import { createResponse } from "create-response";
import URLSearchParams from "url-search-params";
import JwtValidator from "jwt-validator/index.js";

//JWT publickeyset
const jwksPublicKey = {
  kty: "RSA",
  e: "AQAB",
  use: "sig",
  kid: "test-rs256",
  alg: "RS256",
  n: "824A0aqWnPhKBy8PBqvumTJ8QT4QQXVy7ojB2fXUV0YJ3hjXa0S_1L-wScR4fnFCB83stJVl89QGoYwqNzOJOw",
};

function getJwt(request) {
  let authHeader = request.getHeader("Authorization").toString();
  if (!authHeader || authHeader.substring(0, 6) !== "Bearer") {
    return null;
  }
  return authHeader.substring(6).trim();
}

async function entitlementCheck(jwtToken) {
  const jwtValidator = new JwtValidator(jwksPublicKey);
  const jwtData = jwtValidator.verify(jwtToken);

  //is JWT valid?
  if (jwtData.isvalid) {
    logger.log("JWT is valid");
  }
  //claim check
  if (jwtData.payload.admin) {
    logger.log("JWT claim check");
  }

  //doOtherEntitlementChecks();

  return jwtData.isvalid;
}

function createErrorResponse(message) {
  logger.log("entered createError Response");
  return createResponse(
    400,
    { "Content-Type": ["application/json;charset=utf-8"] },
    JSON.stringify({ error: message })
  );
}

export async function responseProvider(request) {
  logger.log("entered response Provider");

  //extract JWT and do Entitlement check
  const jwtToken = getJwt(request);
  if (!jwtToken) {
    return createErrorResponse("Could not retrieve JWT token!");
  }
  let isAuthorized = await entitlementCheck(jwtToken);
  logger.log("isAuthorized is this-> %o ", isAuthorized);
  if (!isAuthorized) {
    return createErrorResponse(
      "This user is not authorized to access this stream"
    );
  }

  //get the right key to generate token from EdgeKV or keySet
  const params = new URLSearchParams(request.query);
  const partnerId = params.get("tokenFor");
  if (!partnerId) {
    return createErrorResponse("tokenFor Parameter is mandatory");
  }

  let EA_ENCRYPTION_KEY = "";
  let EA_ENCRYPTION_DEFAULT_KEY = "b6e9bb9361116402c8e0ee6de2eb2ec6";

  let isEKVrequired = params.get("ekv") ? params.get("ekv").toString() : 0;
  if (isEKVrequired) {
    logger.log("ekv is required -> %o ", isEKVrequired);
    const edgeKv = new EdgeKV({ namespace: "tokenAuth", group: "grp1" });
    try {
      EA_ENCRYPTION_KEY = await edgeKv.getText({
        item: partnerId,
        default_value: EA_ENCRYPTION_DEFAULT_KEY,
      });
    } catch (error) {
      logger.log("Edgekv error!");
      return createErrorResponse(error.toString());
    }
  } else {
    logger.log("no ekv required");
    let keySet = {
      partner1: "b6e9bb9361116402c8e0ee6de2eb2ec1",
      partner2: "337b571d2266cb95bb1b42584b14c174",
      partner3: "b6e9bb9361116402c8e0ee6de2eb2ec2",
    };
    let pickedkey = keySet[partnerId];
    if (!pickedkey) {
      return createErrorResponse("partnerid does not exist in the keySet");
    }
    EA_ENCRYPTION_KEY = pickedkey;
  }

  //EA_ENCRYPTION_KEY = "b6e9bb9361116402c8e0ee6de2eb2ec6";

  //Generate Token
  let token_start_time = Math.trunc(Date.now() / 1000);
  let token_validity_window = 300;
  let token_end_time = Math.trunc(Date.now() / 1000) + token_validity_window;

  let token = "empty";
  let aclTokenGen = true;
  let acl = ["/*"];
  let urlPath = request.getHeader("urlpath")
    ? request.getHeader("urlpath").toString()
    : 0;
  if (urlPath) {
    logger.log("urlPath is this-> %o ", urlPath);
    aclTokenGen = false;
  } else {
    logger.log("urlPath header is missing");
  }

  if (aclTokenGen) {
    logger.log("ACL token");
    var ea = new EdgeAuth({
      key: EA_ENCRYPTION_KEY,
      startTime: token_start_time,
      endTime: token_end_time,
      escapeEarly: false,
    });
    token = ea.generateACLToken(acl);
  } else {
    logger.log("URL token");
    var ea = new EdgeAuth({
      key: EA_ENCRYPTION_KEY,
      startTime: token_start_time,
      endTime: token_end_time,
      escapeEarly: false,
    });
    token = ea.generateURLToken(urlPath);
  }

  logger.log("token is this-> %o ", token);

  let successresponse = {
    tokenvalue: token,
  };

  return Promise.resolve(
    createResponse(
      200,
      { "Content-Type": ["application/json"], "Token-For": [partnerId] },
      JSON.stringify(successresponse)
    )
  );
}

export function onClientResponse(request, response) {
  logger.log("Adding a header in onClientResponse");
  response.setHeader("Info", "Token Generated from Akamai Edgeworkers");
}
