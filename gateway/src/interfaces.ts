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
