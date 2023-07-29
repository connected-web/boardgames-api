# Download files from legacy Boardgames SAM API in Calisaurus AWS Account
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."

aws s3 sync s3://boardgames-tracking .