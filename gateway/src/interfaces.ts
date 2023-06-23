import { Iotee } from "@iotee/node-iotee";
import { MqttService } from "./services/mqtt";

export interface ThingConfig {
  iotee: Iotee;
  mqttService: MqttService;
}

export interface MqttConfig {
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
