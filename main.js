import { logger } from 'log'; // Import the logger module export function
import {EdgeAuth} from 'edgeauth.js';

import URLSearchParams from 'url-search-params';

export function onClientRequest (request) {
  logger.log('gold');
  
  logger.log('Adding a header in onClientRequest');
  logger.log("The request's host is: %s", request.host);
  logger.log("The request's method is: %s", request.method)
  logger.log("The request's path is: %s", request.path)
  logger.log("The request's cpcode is: %s", request.cpCode)

  //var EA_HOSTNAME = 'edgeauth.akamaized.net'
  var EA_ENCRYPTION_KEY = 'b6e9bb9361116402c8e0ee6de2eb2ec6' 

  var ea = new EdgeAuth({
    key: EA_ENCRYPTION_KEY,
    startTime: 1626343200,
    endTime: 1626775200,
    escapeEarly: false
  })
  var acl = ["/*"]
  var token =  ea.generateACLToken(acl)
  request.respondWith(200, {'ShortToken': [token]}, "Response from Edgeworkers");

  /*
  var params = new URLSearchParams(request.query);
  
  
  var key = params.get('key')

  var ea = new EdgeAuth({
    key: EA_ENCRYPTION_KEY,
    windowSeconds: DURATION,
    escapeEarly: true
  })

  
  var sha256 = CryptoJS.SHA256(key);

	var base64 = CryptoJS.enc.Base64.stringify(sha256);

	var hmac256 = CryptoJS.HmacSHA256(key, "123455");

	var hmac256Base64 = CryptoJS.enc.Base64.stringify(hmac256);

	request.respondWith(200, {'SHA256': [sha256], 'Base64': [base64], 'hmac256':[hmac256], 'hmac256Base64':[hmac256Base64] }, "");*/


/*
  if (params.get('key') === 'abc123') {
    request.respondWith(200, { 'Content-Type': ['text/html'] }, '<html>Welcome to the conference.<br>Here are the venue details:<br><b>123 Main Street, San Francisco, CA<br>Dec, 6th 2019 10pm sharp</b></html>');
  } else {
    request.respondWith(200, { 'Content-Type': ['text/html'] }, '<html>You have entered an incorrect code.</html>');
  }*/
}
export function onOriginRequest (request) {
  logger.log('silver');
}
export function onOriginResponse (request, response) {
  logger.log('bronze');
}

//Create logs in the onClientResponse phase
export function onClientResponse (request, response) {
  // Outputs a message to the X-Akamai-EdgeWorker-onClientResponse-Log header.
    logger.log('Adding a header in onClientResponse');
    response.setHeader('EdgeworkerResponse', 'Response from Edgeworkers');
 }

export function responseProvider (request) {
  logger.log('steel');
}

