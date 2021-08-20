# Edgeworkers Token Auth
[Token Generation](https://learn.akamai.com/en-us/webhelp/adaptive-media-delivery/adaptive-media-delivery-implementation-guide/GUID-740A5744-09DA-4763-A652-CBDDE5CC0133.html) for delivering secured content via Akamai's AMD/DD has been one of the herculean tasks for customers. This is due to overhead and incompatibility issues of setting up and running the Token Generation [SDK](https://techdocs.akamai.com/adaptive-media-delivery/docs/generate-a-token-and-apply-it-to-content) at the Customer's Infrastructure. Additionally weaker security at TokenGen endpoint has caused Video Piracy to spike up. Token Generation at [Edgeworkers](https://developer.akamai.com/akamai-edgeworkers-overview) is aimed to solve the aforementioned problems along with handling the scale and security for Token Generation.

### Additional Features
- Uses JWT Tokens for Authorization of the Users.
- Uses EdgeKV of Akamai which is a Key-Value database. 
- Framework to plugin additional Entitlement Checks

### Workflow
![Screenshot](images/workflow.png)


### Prerequisites
Copy the Telegram Access Token in to a credentials file. The telegram access token looks like this
```
[telegram]
accessToken = 1891112227:AAHdsasd&askjlasMIya6ppKGu9lAKluiMtkwdSsiZdx_f0
```





## How to run the Script ?
```
$ python3 indiaNewsNotifier.py
```

## Output






ACL token test 
curl 'http://104.71.71.187/tg?tokenFor=partner2'   -H 'Connection: keep-alive'   -H 'Pragma: akamai-x-ew-debug, akamai-x-ew-debug-rp, akamai-x-get-client-ip, akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no, akamai-x-feo-trace, akamai-x-get-request-id, x-akamai-a2-trace,x-akamai-rua-debug,x-akamai-a2-enable, x-akamai-cpi-trace, akamai-x-get-brotli-status'   -H 'Cache-Control: no-cache'   -H 'Upgrade-Insecure-Requests: 1'   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'   -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'   -H 'Accept-Language: en-US,en;q=0.9,es;q=0.8'   -H 'Akamai-EW-Trace:st=1629289813~exp=1629293413~acl=/*~hmac=a20ecc59efc51b67307917c40b93018ee746883d6b580e8ffce2b63d980e104d'   --compressed   --insecure -H "Host:token.ageekwrites.tech" --verbose -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.fHnA09dGcktdK7cDE3p3aqB1BHBDdmt-DkI3wgk6PZpLEJxCmCsi7DamHdj_rQMMnkVG2YyiSHBQRHqHDLBlZw"

URL token test
curl 'http://104.71.71.187/tg?tokenFor=partner2'   -H 'Connection: keep-alive'   -H 'Pragma: akamai-x-ew-debug, akamai-x-ew-debug-rp, akamai-x-get-client-ip, akamai-x-cache-on, akamai-x-cache-remote-on, akamai-x-check-cacheable, akamai-x-get-cache-key, akamai-x-get-extracted-values, akamai-x-get-nonces, akamai-x-get-ssl-client-session-id, akamai-x-get-true-cache-key, akamai-x-serial-no, akamai-x-feo-trace, akamai-x-get-request-id, x-akamai-a2-trace,x-akamai-rua-debug,x-akamai-a2-enable, x-akamai-cpi-trace, akamai-x-get-brotli-status'   -H 'Cache-Control: no-cache'   -H 'Upgrade-Insecure-Requests: 1'   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'   -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'   -H 'Accept-Language: en-US,en;q=0.9,es;q=0.8'   -H 'Akamai-EW-Trace:st=1629289813~exp=1629293413~acl=/*~hmac=a20ecc59efc51b67307917c40b93018ee746883d6b580e8ffce2b63d980e104d'   --compressed   --insecure -H "Host:token.ageekwrites.tech" --verbose -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.fHnA09dGcktdK7cDE3p3aqB1BHBDdmt-DkI3wgk6PZpLEJxCmCsi7DamHdj_rQMMnkVG2YyiSHBQRHqHDLBlZw" -H "urlpath:/a/b/c/master.m3u8"
