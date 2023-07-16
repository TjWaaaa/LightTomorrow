## Gateway Software Quickstart

1. Setup env

```sh
cp example.env .env
```

2. Install dependencies

```sh
npm i
```

3. Run gateway software

```sh
npm start
```

### Testing

```
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------|---------|----------|---------|---------|-------------------
All files                   |     100 |      100 |     100 |     100 |
 src                        |     100 |      100 |     100 |     100 |
  interfaces.ts             |     100 |      100 |     100 |     100 |
 src/services               |     100 |      100 |     100 |     100 |
  actuatorService.ts        |     100 |      100 |     100 |     100 |
  mqtt.ts                   |     100 |      100 |     100 |     100 |
 src/services/sensor        |     100 |      100 |     100 |     100 |
  lightSensorService.ts     |     100 |      100 |     100 |     100 |
  proximitySensorService.ts |     100 |      100 |     100 |     100 |
  sensorService.ts          |     100 |      100 |     100 |     100 |
----------------------------|---------|----------|---------|---------|-------------------
Test Suites: 5 passed, 5 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        11.859 s
```
