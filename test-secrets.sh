export CLIENT_ID="4ibp2u08e7a6lpv8vkjo7trcvu"
# export CLIENT_SECRET="already on shell"

set -euo pipefail

OAUTH_URL="https://connected-web.auth.eu-west-2.amazoncognito.com"

if [[ -z "${CLIENT_SECRET:-}" ]]; then
  echo "CLIENT_SECRET is not set. Export it before running." >&2
  exit 1
fi

echo "OAuth URL: ${OAUTH_URL}"
echo "Client ID suffix: ${CLIENT_ID: -4}"

echo "Requesting token..."
TOKEN_RESPONSE_FILE="$(mktemp)"
HTTP_STATUS=$(curl -sS --http1.1 -o "${TOKEN_RESPONSE_FILE}" -w "%{http_code}" -X POST "${OAUTH_URL}/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "${CLIENT_ID}:${CLIENT_SECRET}" \
  -d "grant_type=client_credentials" || true)

TOKEN_RESPONSE=$(cat "${TOKEN_RESPONSE_FILE}")
echo "HTTP status: ${HTTP_STATUS}"
echo "Response: ${TOKEN_RESPONSE}"

if [[ "${HTTP_STATUS}" != "200" ]]; then
  echo "Token request failed." >&2
  exit 1
fi

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token // empty')
if [[ -z "$ACCESS_TOKEN" || "$ACCESS_TOKEN" == "null" ]]; then
  echo "No access_token in response." >&2
  exit 1
fi

echo "Token acquired (length: ${#ACCESS_TOKEN})."
