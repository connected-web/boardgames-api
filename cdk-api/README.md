# Board Games API CDK Stack

This is a AWS CDK stack definition for the Board Games API 2023 edition.

### Implemented features
- API Gateway
- SSO Authorization using Connected Web shared Auth services
- Track play record (untested)
- List play records with multi layer caching - byAllTime, byYear, byMonth
- Deployed via Github Actions using preconfigured OIDC relationship

### Wishlist
- Generate board game stats on the fly for any time period
- Cache play records from raw entries
- Flush and regenerate play records for a given time period

## Manual Testing

From your AWS Account:

```sh
export CONNECTED_WEB_DEV_SSO_CLIENT_ID="..."
export CONNECTED_WEB_DEV_SSO_SECRET="..."
export APP_AUTH_TOKEN=$(node getOAuthToken.mjs --dev)
```

Then use that token:

```sh
curl -H "Authorization: Bearer $APP_AUTH_TOKEN" https://boardgames-api.dev.connected-web.services/status
```

Or:

```sh
export CONNECTED_WEB_PROD_SSO_CLIENT_ID="..."
export CONNECTED_WEB_PROD_SSO_SECRET="..."
export APP_AUTH_TOKEN=$(node getOAuthToken.mjs --prod)
```

Then use that token:

```sh
curl -H "Authorization: Bearer $APP_AUTH_TOKEN" https://boardgames-api.prod.connected-web.services/status
```

The CLIENT_ID and CLIENT_SECRET values can then be saved to your `~/.bashrc` equivalent and loaded on each terminal.

⚠️ Be careful not to reveal the CLIENT_ID and CLIENT_SECRET values as they can be used to get OAuth tokens.

If credentials leak; you will need to remove the App Integration from Cognito and create new credentials.

## Restoring Data

You can upload existing (playrecords) data to a target bucket to restore data to the API.

Log in to your AWS management console, find the correct AWS Account, and get the appropriate keys:

```sh
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

Then sync to a target bucket for the selected environment, e.g. Dev:

```sh
aws s3 sync data/playrecords s3://boardgames-api-playrecords-dev/playrecords/
```

Or Prod:

```sh
aws s3 sync data/playrecords s3://boardgames-api-playrecords-prod/playrecords/
```

## Backing up Data

In reverse, download all the files to your local machine. 

```sh
aws s3 sync s3://boardgames-api-playrecords-prod/playrecords/ data/playrecords
```
