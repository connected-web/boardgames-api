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
[Board Game API Run] Available scripts to run:
  node run create-bgg-index
  node run create-boardgame-index
  node run create-boardgame-list
  node run download-bgg-collection
  node run download-bgg-entries
  node run download-cali-playstats
```

### Run All

`node run all`

Runs all of the following commands; all at once, in parallel.

### Create Board Game Geek Index

`node run create-bgg-index`

Creates `data/bgg-index.json` based on data from our Board Game Geek collection; `data/bgg-collection.json`

### Create Board Game Index

`node run create-boardgame-index`

Creates `data/boardgame-index.json` based on a unified view of Cali Play Stats and the Board Game Geek collection.

### Create Board Game List

`node run create-boardgame-list`

Creates `data/boardgame-names.json` based on a unified view of Cali Play Stats and the Board Game Geek collection.

### Download Board Game Geek Collection

`node run download-bgg-collection`

Downloads `data/bgg-collection.json` from our Board Game Geek collection, as XML and converts it to JSON.

### Download Board Game Geek Entries

`node run download-bgg-entries`

Downloads individual board game entries to `boardgames/boardgame-${bggGameId}.json` from Board Game Geek based on our Board Game Geek collection `data/bgg-collection.json`. This can be quite slow, but will retry until it got healthy responses for all boardgame IDs.

### Download Cali Play Stats

`node run download-cali-playstats`

Downloads `data/cali-playstats.json` from Google Sheets and converts to JSON.

## APIs
Data is sourced from the following APIs:

| Name                   | Template                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Board Games Collection | `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}` |
| Board Game Entries     | `https://www.boardgamegeek.com/xmlapi2/thing?id=${objectId}&stats=1`    |
| Board Game Play Stats  | `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`        |
