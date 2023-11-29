# Synchronise data to/from S3 buckets

# Get these values from: https://connected-web.awsapps.com/start/
#export AWS_ACCESS_KEY_ID="..."
#export AWS_SECRET_ACCESS_KEY="..."
#export AWS_SESSION_TOKEN="..."

DEV_S3="s3://boardgames-api-playrecords-dev"
PROD_S3="s3://boardgames-api-playrecords-prod"

function syncToProd() {
  aws s3 sync data "$PROD_S3"
}

function syncToDev() {
  aws s3 sync data "$DEV_S3"
}

function moveOriginalToPlayrecordsProd() {
  aws s3 --recursive cp "$PROD_S3/original" "$PROD_S3/playrecords"
}

function moveOriginalToPlayrecordsDev() {
  aws s3 --recursive cp "$DEV_S3/original" "$DEV_S3/playrecords"
}

function syncFromProd() {
  aws s3 sync "$PROD_S3" data
}

function syncFromDev() {
  aws s3 sync "$DEV_S3" data
}

syncFromProd