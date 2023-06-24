import { Iotee } from "@iotee/node-iotee";
import { MqttService } from "./services/mqtt";

export interface Thing {
  iotee: Iotee;
  mqttService: MqttService;
}

export interface Mqtt {
  host: string;
  port: number;
  caPath: string;
  certPath: string;
  keyPath: string;
  clientId: string;
}

export enum SensorMode {
  AUTO = "AUTO",
  MANUAL = "MANUAL",
}
