DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
DEPLOYDIR="$DIR/../../deploy"

USERNAME=$1
PASSWORD=$2

cp "$DEPLOYDIR/.ftppass-template" "$DEPLOYDIR/.ftppass"

UA='"username": ""'
UB="\"username\": \"$USERNAME\""
sed -i -e "s/$UA/$UB/" "$DEPLOYDIR/.ftppass"

PA='"password": ""'
PB="\"password\": \"$PASSWORD\""
sed -i -e "s/$PA/$PB/" "$DEPLOYDIR/.ftppass"

rm "$DEPLOYDIR/.ftppass-e"