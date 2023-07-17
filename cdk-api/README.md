# Board Games API CDK Stack

This is a AWS CDK stack definition for the Board Games API 2023 edition.

### Planned features
- API Gateway
- SSO Authorization using Connected Web shared Auth services
- Track play record
- List play records
- Deployed via Github Actions using preconfigured OIDC relationship

### Wishlist
- Generate board game stats on the fly for any time period
- Cache play records from raw entries
- Flush and regenerate play records for a given time period