// https://tools.ietf.org/html/rfc7517
// https://tools.ietf.org/html/rfc3447

//import CryptoES from '/crypto-es/index.js';
import { base64url } from "/rfc4648/index.js";

import { Base64 } from '/crypto-es/enc-base64.js';
import { Hex, Latin1 } from '/crypto-es/core.js';
import { SHA256 } from '/crypto-es/sha256.js';

let JwtValidator = (function() {

  const algs = {
    'RS256': {
      hash: SHA256,
      algorithmIdentifier: "3031300d060960864801650304020105000420"
    }
  }

  function base64ToString (base64) {
  	let wordArray = Base64.parse(base64);
  	return Latin1.stringify(wordArray);
  }

  function base64ToObj (base64) {
  	return JSON.parse(base64ToString(base64))
  }


  function base64ToArray(base64) {
    return base64url.parse(base64, { loose: true });
  }

  function arrToBigInt (arr) {

    //Works, but is very memory inefficient due to number of intermediate BigInts created.
    //return arr.reduce((total, currentValue)=>total * 256n + BigInt(currentValue), 0n);

    //Also memory inefficient
    /*let result = 0n
    for (var i = 0; i < arr.length; i++) {
      var curr = arr[i];
      result = result * 256n + BigInt(curr);
    }
    return result;*/

    //Converting to a string first is more memory efficient because it avoids intermediate BigInts
    return BigInt("0x" + byteArrToStr(arr));


  }

  function base64ToBigInt(base64) {
  	let arr = base64ToArray(base64);
  	return arrToBigInt(arr);
  }

  function bigIntToString(x, xLen) {
    let xstr = x.toString(16);
    let padLen = xLen*2-xstr.length;
    xstr = '0'.repeat(padLen) + xstr;
    return xstr;
  }

  const byte2String = []
  for (var i = 0; i < 256; i++) {
    byte2String.push(i<16 ? '0'+i.toString(16) : i.toString(16));
  }
  function byteArrToStr (arr) {
    //not memory efficient
    //return arr.reduce((output, elem) =>
    //  (output + ('0' + elem.toString(16)).slice(-2)),
    //  '');

    let strArr = new Array (arr.length);
    for (var i = 0; i < arr.length; i++) {
      strArr[i] = byte2String[arr[i]];
    }
    return strArr.join("");

  }

  function modularPow(base, exponent, modulus) {
    if (modulus == 1n) {
          return 0n;
  	}

    let result = 1n;

    if (base > modulus) {
      base = base % modulus
    }

    while (exponent > 0) {
      if (exponent % 2 == 1) {
        result = (result * base) % modulus
  		}
      exponent = exponent >> 1

      if (exponent > 0) {
        base = (base * base) % modulus
      }
  	}
    return result;

  }

  function emsaPkcs1v15Encode (M, emLen, alg) {
    let H = alg.hash(M);
    let T = alg.algorithmIdentifier + H.toString(Hex);

    let tLen = T.length/2;
    if (emLen < tLen + 11) {
      throw new Error("intended encoded message length too short");
    }

    let PSLen =  emLen - tLen - 3;
    let PS = 'ff'.repeat(PSLen);
    let result = "0001" + PS + "00" + T;
    return result;
  }

  function validatePkcsSignature (message, signature, alg, e, n) {
    const signatureArray = base64ToArray(signature);
    const k = signatureArray.length;
    const s = arrToBigInt(signatureArray);

    const m = rsavp1(n, e, s);

    //let emstr = ""
    let emstr = bigIntToString(m,k);
    //let em2 ="";
    let em2 = emsaPkcs1v15Encode (message, k, alg);

    //return {signatureArray:signatureArray,e:e, n:n, s:s, k:k, m:m, emstr:emstr, emstr2:emstr2, alg:algs[jwk.alg], em2:em2};

    return emstr===em2;

  }

  function rsavp1 (n, e, s) {
  	if (s < 0n || s > n-1n) {
  		throw new Error("signature representative out of range");
  	}

  	return modularPow(s, e, n);
  }

  class JwtValidator {
    constructor(jwk) { //TODO: pass key in constructor
      this.jwk=jwk;
      this.alg = algs[jwk.alg];

      if (! this.alg) {
        throw new Error (`Unsupported Algorithm: ${alg}`)
      }

      this.e = Number(base64ToBigInt(jwk.e)); //optimize later
      this.n = base64ToBigInt(jwk.n);
    }

    verify(jwt){
      const jwtParts = jwt.split('.');
    	const headerInBase64UrlFormat = jwtParts[0];
    	const payloadInBase64UrlFormat = jwtParts[1];
    	const signatureInBase64UrlFormat = jwtParts[2];
      const signedMessaged = headerInBase64UrlFormat + '.' + payloadInBase64UrlFormat;

      let valid = validatePkcsSignature(signedMessaged, signatureInBase64UrlFormat, this.alg, this.e, this.n);
      let jwtPayload = base64ToObj(payloadInBase64UrlFormat);

      return {isvalid: valid, payload: jwtPayload};
    }
  }

  return JwtValidator;
})();

export default JwtValidator;
