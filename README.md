# Boardgames API

An API for personalized boardgame data, sourced from boardgamesgeek.com and other locations.

## Setup

Clone this repo, change to source directory, then run:
```
npm install
npm start
```

## Usage

For a list of commands, use `node run`; this outputs:
```
[Boardgame API Run] Available scripts to run:
  node run create-boardgame-index
  node run create-boardgame-list
  node run download-boardgame-collection
  node run download-boardgame-entries
  node run download-gsheets-data
```

To update the board game collection summary from board game geek (`bgg-collection.json`) based on username then run:

```
node run download-boardgame-collection
```

To download JSON representation of games in board game geek (`boardgames/boardgame-#.json`), based on your index of boardgames (`boardgame-index.json`) then run:

```
node run download-boardgame-entries
```

The batching for this script has been set at 2 items every 3 seconds to guarantee that the server doesn't reject your queries. You can experience with larger batches, or a shorter delay to speed things up; but be aware that the server can return "No server available" messages; or you can end up with socket disconnect errors if you try and make too many requests too fast.

To download recent play data from google sheets (`cali-boardgames.json`), based on our customer play data:

```
node run download-gsheets-data
```

To create an index of board game names to ids (`boardgame-index.json`), based on your boardgame collection (`bgg-collection.json`), then run:

```
node run create-boardgame-index
```

To create a list of board game stats based on game names (`boardgame-names.json`), based on your boardgame collection (`bgg-collection.json`), then run:

```
node run create-boardgame-list
```

## APIs

Data is sourced from the following APIs:

| Name                  | Template                                                                |
| --------------------- | ----------------------------------------------------------------------- |
| Boardgames Collection | `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}` |
