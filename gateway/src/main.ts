import { Iotee, LogLevel } from "@iotee/node-iotee";
import { config } from "dotenv";
import { Mqtt } from "./interfaces";
import { LightActuatorService } from "./services/actuatorService";
import { MqttService } from "./services/mqtt";
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
    host: process.env.MQTT_HOST!,
    port: parseInt(process.env.MQTT_PORT!),
    caPath: process.env.CA_PATH!,
    certPath: process.env.CERT_PATH!,
    keyPath: process.env.KEY_PATH!,
    clientId: process.env.DEVICE_ID!,
  };

  const mqttService = new MqttService(mqttConfig);
  await mqttService.connect();

  new deviceType[process.env.DEVICE_TYPE as DeviceType](iotee, mqttService);
};

main().catch((err) => console.error(err));
