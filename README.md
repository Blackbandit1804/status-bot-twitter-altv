# Setup

1. Setup the worker and paste in worker.js
2. Create the following environment variables

| Name | Example |
| --- | --- |
| ALTV_SERVER_ID  | d4a0b02f13c779d3e5cae5dd241eaaf7  |
| CONSUMER_SECRET  | Get this at the Twitter Developer Portal  |
| OAUTH_CONSUMER_KEY  | Get this at the Twitter Developer Portal  |
| OAUTH_TOKEN  | Get this at the Twitter Developer Portal  |
| OAUTH_TOKEN_SECRET  | Get this at the Twitter Developer Portal  |

3. Create a cron job (every 2 minutes should be enough)
4. Create a KV Namespace and link it
5. Create the following Vars in the KV Namespace

| Name | Example |
| --- | --- |
| last_online  | Tue Oct 12 2021 10:42:45 GMT+0000 (Coordinated Universal Time)  |
| last_update  | true  |
| player_record  | 200  |
