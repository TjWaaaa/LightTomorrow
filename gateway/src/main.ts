import { Iotee, LogLevel } from "@iotee/node-iotee";
import { config } from "dotenv";
import { MqttConfig, MqttService } from "./services/mqtt";

// Read .env variables
config();

const main = async () => {
  const iotee = new Iotee(process.env.DEVICE_URL!);

  iotee.setLogLevel(LogLevel.WARN); // Set the verbosity of the API

  await iotee.connect();

  // Do your commands here
};

// main()
//   .then(() => {})
//   .catch((err) => console.error(err));

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
