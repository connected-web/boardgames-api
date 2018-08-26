# Boardgames API

An API for personalized boardgame data, sourced from boardgamesgeek.com and other locations.

## Setup

Clone this repo, change to source directory, then run:
```
npm install
npm start
```

To update your boardgame collection summary (`bgg-collection.json`) based on your username then run:

```
node fetch-collection.js john
```

To create an index of boardgame names to ids (`boardgame-index.js`), based on your boardgame collection (`bgg-collection.json`), then run:

```
node create-boardgame-index.js
```

To download JSON representation of games in boardgame geek (`boardgames/boardgame-#.json`), based on your index of boardgames (`boardgame-index.json`) then run:

```
node fetch-boardgames.js
```

The batching for this script has been set at 2 items every 3 seconds to guarantee that the server doesn't reject your queries. You can experience with larger batches, or a shorter delay to speed things up; but be aware that the server can return "No server available" messages; or you can end up with socket disconnect errors if you try and make too many requests too fast.

## APIs

Data is sourced from the following APIs:

| Name                  | Template                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| Boardgames Collection | `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}` |
