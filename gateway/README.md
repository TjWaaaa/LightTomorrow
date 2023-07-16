## Gateway

1. Get Deploy:Archive Artifact from Pipeline

2. Insert Packages from Deploy:Archive into project folder

3. Choose thing Package and copy .env of thing to gateway .env

```sh
cp ./packages/<wanted-thing>/.env ./gateway/.env
```

4. Insert Device URL of your thing in .env

5. Install dependencies

```sh
npm i
```

6. Run gateway software

```sh
npm run start
```

### Testing

The gateway software is tested using `jest`.

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
