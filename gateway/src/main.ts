import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { config } from "dotenv";
import { MqttConfig, MqttService } from "./services/mqtt";
import { LightSensorService } from "./services/lightSensorService";

// Read .env variables
config();

const main = async () => {
  console.log(process.env.DEVICE_URL);
  const iotee = new Iotee(process.env.DEVICE_URL!);
  let counter = 50;

  iotee.setLogLevel(LogLevel.WARN); // Set the verbosity of the API

  await iotee.connect();

  const mqttConfig: MqttConfig = {
    host: "a2scw8p2blnw89-ats.iot.eu-central-1.amazonaws.com",
    port: 8883,
    caPath: process.env.CA_PATH!,
    certPath: process.env.CERT_PATH!,
    keyPath: process.env.KEY_PATH!,
    clientId: process.env.DEVICE_ID! //"thing_ae3be5a7922dee37",
  };

  const mqttService = new MqttService(mqttConfig);
  //await mqttService.connect();

  // Do your commands here

  new LightSensorService({ iotee: iotee, mqttService: mqttService, deviceID: process.env.DEVICE_ID! });

  // iotee.on(ReceiveEvents.ButtonPressed, async (payload) => {
  //   console.log("Button pressed:", payload)
  //   switch (payload[0]) {
  //     case 'A':
  //       counter++; break;
  //     case 'B':
  //       counter++; break;
  //     case 'X':
  //       counter--; break;
  //     case 'Y':
  //       counter--; break;
  //     default:
  //       console.log("failed")
  //   }
  //   await iotee.setDisplay("current light level: " + counter.toString());

  // }
  // );
};

main()
  .then(() => { })
  .catch((err) => console.error(err));

/*
const mqttAwsTesting = async () => {
  const config: MqttConfig = {
    host: "a2scw8p2blnw89-ats.iot.eu-central-1.amazonaws.com",
    port: 8883,
    caPath: "./certs/root-CA.crt",
    certPath: "./certs/certificate.pem.crt",
    keyPath: "./certs/private.pem.key",
    clientId: "thing_ae3be5a7922dee37",
  };

  const mqttService = new MqttService(config);

  mqttService
    .connect()
    .then(() => {
      mqttService.subscribe("my/topic", (message) => {
        console.log(`Received message on my/topic: ${message}`);
      });
    })
    .catch((err) => {
      console.error(`Failed to connect: ${err}`);
    });

  // Clean up and disconnect MQTT connection before application exit
  process.on("SIGINT", function () {
    mqttService.disconnect();
    process.exit();
  });
};

mqttAwsTesting();

*/
