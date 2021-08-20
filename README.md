# Edgeworkers Token Auth
[Token Generation](https://learn.akamai.com/en-us/webhelp/adaptive-media-delivery/adaptive-media-delivery-implementation-guide/GUID-740A5744-09DA-4763-A652-CBDDE5CC0133.html) for delivering content via Akamai's AMD/DD has been one of the herculean tasks for customers. This is due to overhead and incompatibility issues of setting up and running the Token Generation [SDK](https://techdocs.akamai.com/adaptive-media-delivery/docs/generate-a-token-and-apply-it-to-content) at the Customer's Infrastructure. Additionally weaker security at TokenGen endpoint has caused Video Piracy to spike up. Token Generation at [Edgeworkers](https://developer.akamai.com/akamai-edgeworkers-overview) is aimed to solve the aforementioned problems along with handling the scale and security for Token Generation.

### Additional Features
- Uses JWT Tokens for Authorization of the Users.
- Uses EdgeKV of Akamai which is a Key-Value database. 
- Framework to plugin additional Entitlement Checks

### Workflow
![Screenshot](images/workflow.png)


## Prerequisites
### Configure the SMP Behavior in Delivery Config
Configure the Segmented Media Protection Behavior in case of AMD/DD/OD or Auth Token 2.0 Verification in case of Web Products along with the Encryption Key.
![Screenshot](images/SMPBehavior.jpg)


### Upload Keys in Edge KV 
If you want to manage keys in EKV, you can create a EdgeKV and Upload the keys. More about EdgeKV [here](https://learn.akamai.com/en-us/webhelp/edgeworkers/edgekv-user-guide/GUID-FA85D8AF-F277-4FD0-B789-17312DBD3DDE.html)

#### EdgeKV Initialization
```
akamai edgekv init 
```
#### Create NameSpace
```
akamai edgekv create ns staging tokenAuth --retention 90 --accountkey B-M-28QYF3M
```

#### Add data to the Namespace
```
akamai edgekv write text staging tokenAuth grp1 partner1 "b6e9bb9361116402c8e0ee6de2eb2ec6"
akamai edgekv write text staging tokenAuth grp1 partner2  "9de7fb24dd6811ea87d00242ac130003"
```

### Manual Key Upload 
If you donot want to use the EdgeKV, then you can upload the keys to different partners in the main.js file in a json dict
```
let keySet = {
      partner1: "b6e9bb9361116402c8e0ee6de2eb2ec1",
      partner2: "337b571d2266cb95bb1b42584b14c174",
      partner3: "b6e9bb9361116402c8e0ee6de2eb2ec2",
    };
``` 

#### JWT Public Key Addition
Enter the JWT Public Keyset to the main.js file to ensure that JWT token gets validated.
//JWT publickeyset
const jwksPublicKey = {
  kty: "RSA",
  e: "AQAB",
  use: "sig",
  kid: "test-rs256",
  alg: "RS256",
  n: "824A0aqWnPhKBy8PBqvumTJ8QT4QQXVy7ojB2fXUV0YJ3hjXa0S_1L-wScR4fnFCB83stJVl89QGoYwqNzOJOw",
};

#### Create Edgeworker and Upload the Bundle
```
tar -czvf tokenAuth.tgz main.js bundle.json rfc4648/* jwt-validator/* crypto-es/* edgekv.js edgekv_tokens.js utils/*

akamai edgeworkers upload --bundle tokenAuth.tgz 6424

akamai edgeworkers activate 6424 STAGING 2.0

akamai edgeworkers activate 6424 PRODUCTION 2.0
```


### Testing
Generate the ACL Token for Partner2 . Pass the Authorization Header. <br />
Request
```
curl 'http://token.ageekwrites.tech/tg?tokenFor=partner2' -H 'Connection: keep-alive'   -H 'Pragma: akamai-x-ew-debug, akamai-x-ew-debug-rp' --compressed   --insecure -H "Host:token.ageekwrites.tech" --verbose -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.fHnA09dGcktdK7cDE3p3aqB1BHBDdmt-DkI3wgk6PZpLEJxCmCsi7DamHdj_rQMMnkVG2YyiSHBQRHqHDLBlZw"
```
Response
```
{"tokenvalue":"st=1629452072~exp=1629452372~acl=/*~hmac=d7580c326618a78f12f1b108445468d5fd43ebb6d4e5a99c05ec3be433c02838"}
```

Generate the URL Token for Partner2. Pass the Authorization Header. <br />
Request 
```
curl 'http://token.ageekwrites.tech/tg?tokenFor=partner2' -H 'Connection: keep-alive'   -H 'Pragma: akamai-x-ew-debug, akamai-x-ew-debug-rp' --compressed   --insecure -H "Host:token.ageekwrites.tech" --verbose -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.fHnA09dGcktdK7cDE3p3aqB1BHBDdmt-DkI3wgk6PZpLEJxCmCsi7DamHdj_rQMMnkVG2YyiSHBQRHqHDLBlZw" -H "urlpath:/a/b/c/master.m3u8
```

Response
```
{"tokenvalue":"st=1629452415~exp=1629452715~hmac=d993e363f229bdc78c08516beddd2f9c0ee385cf20dda90d11551a7c99f8ad89"}
```

