# Boardgames API

An API for personalized boardgame data, sourced from boardgamesgeek.com and other locations. This project helps gather board game ownership and play stats; collate and analyse that data, and present that data as its own API with documentation.

## Prerequisites

You should already have installed:
- node LTS and npm
- php >= 7

## Setup

Clone this repo, change to source directory, then run:
```
npm install
npm start
```

This should start a local webserver:
```
[PHP Test Server] listening at http://localhost:4000/
```

## Tests

If the webserver is running ok, then you should be able to run:

```
npm test
```

These tests are run when attempting to commit or push back to the central repo.

## Usage

For a list of commands, use `node run`; this outputs:
```
[Board Game API Run] Available scripts to run:
  node run all
  node run convert-playstats-to-playrecords
  node run create-all
  node run create-bgg-index
  node run create-boardgame-feed
  node run create-boardgame-index
  node run create-boardgame-list
  node run create-boardgame-summaries
  node run create-unique-list-of-played-games
  node run download-all
  node run download-bgg-collection
  node run download-bgg-entries
  node run download-cali-playstats
  node run update-all
```

### Run All

`node run all`

Runs download-all, then create-all, in sequence.

### Create All

`node run create-All`

Runs all of the `create-*` commands, in sequence. Logically should be run after downloading updated data from remote servers.

### Create Board Game Geek Index

`node run create-bgg-index`

Creates `data/bgg-index.json` based on data from our Board Game Geek collection; `data/bgg-collection.json`

### Create Board Game Feed

`node run create-boardgame-feed`

Creates `data/boardgame-feed.json` as a date sequenced game feed based on the Cali Play Stats.

### Create Board Game Index

`node run create-boardgame-index`

Creates `data/boardgame-index.json` based on a unified view of Cali Play Stats and the Board Game Geek collection as well as individual game entries in `data/index/{board-game-api-id}.json`.

### Create Board Game List

`node run create-boardgame-list`

Creates `data/boardgame-names.json` based on a unified view of Cali Play Stats and the Board Game Geek collection.

### Create Board Game Summaries

`node run create-boardgame-summaries`

Creates `data/boardgame-summaries.json` and entries for `data/boardgame-summary-{yyyy}-{dd}.json` containing play stats summarised for a given months of the year.

### Create Unique List of Played Games

`node run create-unique-list-of-played-games`

Creates `data/unique-list-of-games-played.json` containing a unique, sorted list of games that have been played based on the Board Game Feed.

### Download All

`node run download-all`

Runs all of the `download-*` commands in sequence. This will take several minutes to complete as it includes running `download-bgg-entries`; but it should ensure all the available data is up to date.

### Download Board Game Geek Collection

`node run download-bgg-collection`

Downloads `data/bgg-collection.json` from our Board Game Geek collection, as XML and converts it to JSON.

### Download Board Game Geek Entries

`node run download-bgg-entries`

Downloads individual board game entries to `boardgames/boardgame-${bggGameId}.json` from Board Game Geek based on our Board Game Geek collection `data/bgg-collection.json`. This can be quite slow, but will retry until it got healthy responses for all boardgame IDs.

### Download Cali Play Stats

`node run download-cali-playstats`

Downloads `data/cali-playstats.json` from Google Sheets and converts to JSON.

### Updated Owned Lists

`node run update-all`

To help update and analyse owned games, this command runs:
- Download Cali Play Stats
- Download Board Game Geek Collection
- Create Unique List of Played Games
- Create Board Game List

## APIs
Data is sourced from the following APIs:

| Name                   | Template                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Board Games Collection | `https://www.boardgamegeek.com/xmlapi2/collection?username=${username}` |
| Board Game Entries     | `https://www.boardgamegeek.com/xmlapi2/thing?id=${objectId}&stats=1`    |
| Board Game Play Stats  | `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`        |

## Workflows

There are three workflows in the .github/workflows/ folder which provide continous integration support for this codebase.

### PR Check

- `.github/workflows/pr-check.yml`

The PR Check workflow runs when raising a PR - it will check for linting, run the unit tests, generate local data, and run the integration tests.

### Deploy

- `.github/workflows/deploy.yml`

The Deploy workflow runs when merging to master - it will run the unit tests, integration tests, and then upload any code and static assets required for the PHP API.

### Update Play Stats

- `.github/workflows/update-play-stats.yml`

The Update Play Stats workflow runs on a schedule, but can also be triggered manually - it will run `update-all`, followed by `create-all` before uploading JSON data to the server to be made available through the PHP API.

### Rehydrate Playrecords

- `.github/workflows/rehydrate-playrecords.yml`

This workflow is manual-only and calls the `POST /playrecords/rehydrate` endpoint to scan S3 keys and (optionally) move misfiled playrecords. It can also rebuild grouped cache files for a given year or for the months it touches. Use this sparingly because it scans S3 prefixes and can be expensive.

Inputs:
- `account`: target environment (`dev` or `prod`).
- `mode`: `all`, `year`, `month`, or `custom` prefix scan.
- `year`/`month`/`prefix`: scope the scan.
- `dryRun`: if true, only reports what would change.
- `maxKeys`: optional scan limit.
- `rebuildTouched`: rebuild grouped caches for months that were touched.
- `rebuildYear`: rebuild grouped caches for all months in a year (e.g. `2025`).

Recommended usage:
- Start with `dryRun=true` to confirm what will move.
- Then rerun with `dryRun=false` and either `rebuildTouched=true` or `rebuildYear=YYYY`.

## S3 Data Layout

Playrecords are stored in an S3 bucket (e.g. `boardgames-api-playrecords-prod`) with a month-based prefix:

```
playrecords/YYYY/MM/<ISO_TIMESTAMP>.json
```

Each object is a single play record JSON document and includes a `date` field in `DD/MM/YYYY` format. The filename uses the creation timestamp, not the play date.

Grouped cache files are stored separately to speed list requests:

```
grouped/byMonth/YYYY-MM_playrecords.json
grouped/byYear/YYYY_playrecords.json
grouped/byAllTime/all_playrecords.json
```

These grouped files are rebuilt by list endpoints or the rehydrate workflow. If the grouped file exists with `[]` (2 bytes), the system will return empty results until the cache is rebuilt.

## Playrecord Endpoints

### Create Play Record

`POST /playrecords/create`

Stores a play record under `playrecords/YYYY/MM/<timestamp>.json` where `YYYY/MM` is derived from the payload `date` (`DD/MM/YYYY` or `YYYY-MM-DD`).

### List Play Records (All)

`GET /playrecords/list`

Returns all play records by reading grouped cache files. It only force-refreshes the current and previous month for the current year; older months return cached results.

### List Play Records By Date

`GET /playrecords/list/{dateCode}`

`dateCode` must be `YYYY` or `YYYY-MM`. This endpoint currently forces a refresh of the cache for the requested date code by listing `playrecords/YYYY/MM/` and rewriting the grouped cache for that month or year.

### Local Testing of Github Workflows

Workflows for pull requests, and build and deploy can be found in `.github/workflows/`.

To test the workflows locally you can install [nektos/act](https://github.com/nektos/act).

`act` requires Docker installed for your operating system.

Once `act` is setup you can then run:
- `act push` : simulate push to master event ; triggers build and deploy
- `act pull_request -P ubuntu-latest=nektos/act-environments-ubuntu:18.04` (Warning: the full ubuntu image requires a cacheable 18GB download at first run)

### Quick Update Commands

To do a quick update of board game stats and upload to the API:
```
node run update-all && node run create-all && node deploy live-summaries
```
