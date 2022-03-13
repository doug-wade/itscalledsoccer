# itscalledsoccer

American Soccer Analysis [released a library](https://www.americansocceranalysis.com/home/2022/2/9/introducing-itscalledsoccer) for interacting with their API for R and Python. This is a Javascript implementation of the same library.

## Getting Started

Install the library

```shell
$ npm i -S itscalledsoccer
```

import the library

```javascript
import Client from "itscalledsoccer";
```

instantiate the client

```javascript
const client = new Client();
```

## Usage

Any of the `get*` methods can be used to retrieve the same data made available in the [American Soccer Analysis app](https://app.americansocceranalysis.com/). Partial matches or abbreviations are accepted for any player or team names. For most methods, arguments _must be named_. A few examples are below.

### getPlayers

```javascript
// Get all players named "Roldan"
const asaPlayers = await client.getPlayers({ names: "Roldan" });
```

### getManagers

```javascript
// Get manager Brian Schmetzer
const asaManager = await client.getManagers({ ids: ["odMXxreMYL"] });
```

### getTeams

```javascript
// Get all MLS stadia
const asaTeam = await client.getStadia({ leagues: ["mls"] });
```

### getReferees

```javascript
// Get all referees
const asaReferees = await client.getReferees({});
```

### getStadia

```javascript
// Get all stadia
const asaStadia = await client.getStadia({});
```
