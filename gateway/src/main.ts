import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { config } from "dotenv";
import { MqttService } from "./services/mqtt";
import { LightActuatorService } from "./services/actuatorService";
import { Mqtt } from "./interfaces";
import { LightSensorService } from "./services/sensor/lightSensorService";
import { ProximitySensorService } from "./services/sensor/proximitySensorService";

config();

enum DeviceType {
  LightSensor = "LightSensor",
  LightActuator = "LightActuator",
  ProximitySensor = "ProximitySensor",
}

const deviceType = {
  [DeviceType.LightSensor]: LightSensorService,
  [DeviceType.LightActuator]: LightActuatorService,
  [DeviceType.ProximitySensor]: ProximitySensorService,
};

const main = async () => {
  console.log(process.env.DEVICE_URL);
  const iotee = new Iotee(process.env.DEVICE_URL!);

  iotee.setLogLevel(LogLevel.WARN);
  await iotee.connect();

  const mqttConfig: Mqtt = {
    host: "a2scw8p2blnw89-ats.iot.eu-central-1.amazonaws.com",
    port: 8883,
    caPath: process.env.CA_PATH!,
    certPath: process.env.CERT_PATH!,
    keyPath: process.env.KEY_PATH!,
    clientId: process.env.DEVICE_ID!,
  };

  const mqttService = new MqttService(mqttConfig);
  //await mqttService.connect();

  new deviceType[process.env.DEVICE_TYPE as DeviceType](iotee, mqttService);
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
