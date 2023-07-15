#!/bin/bash
set -x

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_ROOT="$SCRIPT_DIR/../../.."
ACCOUNTS_PATH="$SCRIPT_DIR/../accounts/"

# To test locally, run: GITHUB_ENV=output.env ./setupGithubEnvironment.sh ascension-dev
[ -z "$GITHUB_ENV" ] && echo "No GITHUB_ENV target set; please run in context of Github Action" && exit 1 || echo "Setting up GITHUB_ENV with additional variables"

ACCOUNT_PROFILE=$1
[ ! -z "$ACCOUNT_PROFILE" ] && echo "ACCOUNT_PROFILE=$ACCOUNT_PROFILE" >> $GITHUB_ENV || exit 1

echo "Find AWS Account ID:"
AWS_ACCOUNT_ID=$(jq -r '.accountId' "${ACCOUNTS_PATH}$ACCOUNT_PROFILE.json" | base64 -d)
[ ! -z "$AWS_ACCOUNT_ID" ] && echo "AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID" >> $GITHUB_ENV || exit 1

echo "Find AWS Account Config:"
AWS_ACCOUNT_CONFIG=$(jq -c . "${ACCOUNTS_PATH}$ACCOUNT_PROFILE.json")
[ ! -z "$AWS_ACCOUNT_CONFIG" ] && echo "AWS_ACCOUNT_CONFIG=$AWS_ACCOUNT_CONFIG" >> $GITHUB_ENV || exit 1

echo "Set ACCOUNT_PROFILE     : $ACCOUNT_PROFILE"
echo "Set AWS_ACCOUNT_ID      : $AWS_ACCOUNT_ID"
echo "Set AWS_ACCOUNT_CONFIG  : $AWS_ACCOUNT_CONFIG"