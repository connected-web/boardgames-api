# Boardgames Browser

A browser for personalized boardgame data, sourced from boardgamesgeek.com and other locations.

## Setup

Clone this repo, change to source directory, then run:
- `npm install`
- `npm start`

To update the boardgame collection based on your username, then run:

```
node fetch-collection.js john
```

## APIs

Data is sourced from the following APIs:

| Name                  | Template                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| Boardgames Collection | `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}` |
