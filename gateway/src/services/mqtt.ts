import * as mqtt from "mqtt";
import * as fs from "fs";
import { URL } from "url";

export interface MqttConfig {
  host: string;
  port: number;
  caPath: string;
  certPath: string;
  keyPath: string;
  clientId: string;
}

export class MqttService {
  private client: mqtt.MqttClient | undefined;

  constructor(private config: MqttConfig) {}

  async connect(): Promise<void> {
    const url = new URL(`mqtts://${this.config.host}:${this.config.port}`);
    const options: mqtt.IClientOptions = {
      key: fs.readFileSync(this.config.keyPath),
      cert: fs.readFileSync(this.config.certPath),
      ca: fs.readFileSync(this.config.caPath),
      protocol: url.protocol as mqtt.IClientOptions["protocol"],
      host: url.hostname,
      port: Number(url.port),
      clientId: this.config.clientId,
      reconnectPeriod: 500000,
    };

    this.client = mqtt.connect(url.toString(), options);

    this.client.on("disconnect", (packet) => console.log("packet", packet));
    this.client.on("close", () => console.log("close"));
    this.client.on("error", (err) => {
      console.error(`Failed to connect to ${this.config.host}: ${err}`);
    });

    await new Promise((resolve, reject) => {
      if (!this.client) return reject("Client not initialized");

      this.client.on("connect", () => {
        console.log(`Connected to ${this.config.host}`);
        resolve(undefined);
      });

      this.client.on("error", (err) => {
        console.error(`Failed to connect to ${this.config.host}: ${err}`);
        reject(err);
      });
    });
  }

  publish(topic: string, message: string): void {
    console.log("publish", topic, message);
    if (!this.client) {
      console.error("Must connect to MQTT broker before publishing message");
      return;
    }

    this.client.publish(topic, message, (err) => {
      if (err) console.error(`Failed to publish message: ${err}`);
    });
  }

  subscribe(topic: string, callback: (payload: string) => void): void {
    console.log("subscribe", topic, callback);
    if (!this.client) {
      console.error("Must connect to MQTT broker before subscribing to topic");
      return;
    }

    this.client.subscribe(topic, (err) => {
      if (err) console.error(`Failed to subscribe to topic: ${err}`);
    });

    this.client.on("message", (topic, payload) => {
      callback(payload.toString());
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
    }
  }
}
