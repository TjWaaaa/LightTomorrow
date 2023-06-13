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

  constructor(private config: MqttConfig) {
    console.log("Initialized MQTT Service with provided configuration");
  }

  async connect(): Promise<void> {
    console.log("Attempting to connect to MQTT broker");

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

    await new Promise((resolve, reject) => {
      if (!this.client) {
        console.error("Client initialization failed");
        return reject("Client not initialized");
      }

      this.client.on("connect", () => {
        console.log(
          `Client with ID ${this.config.clientId} successfully connected to ${this.config.host}`
        );
        resolve(undefined);
      });

      this.client.on("error", (err) => {
        console.error(
          `Client with ID ${this.config.clientId} failed to connect to ${this.config.host}: ${err.message}`
        );
        reject(err);
      });
    });
  }

  publish(topic: string, message: string): void {
    console.log(`Attempting to publish message to topic ${topic}`);

    if (!this.client) {
      console.warn("Must connect to MQTT broker before publishing message");
      return;
    }

    this.client.publish(topic, message, (err) => {
      if (err) {
        console.error(`Failed to publish message: ${err}`);
      } else {
        console.log(`Message successfully published to topic ${topic}`);
      }
    });
  }

  subscribe(
    topic: string,
    callback: (payload: string, topic: string) => void
  ): void {
    console.log(`Attempting to subscribe to topic ${topic}`);

    if (!this.client) {
      console.warn("Must connect to MQTT broker before subscribing to topic");
      return;
    }

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic: ${err}`);
      } else {
        console.log(`Successfully subscribed to topic ${topic}`);
      }
    });

    this.client.on("message", (topic, payload) => {
      console.log(`Received message from topic ${topic}`);
      callback(payload.toString(), topic);
    });
  }

  disconnect(): void {
    console.log("Attempting to disconnect from MQTT broker");

    if (this.client) {
      this.client.end();
      console.log("Successfully disconnected from MQTT broker");
    } else {
      console.warn("No MQTT client to disconnect from");
    }
  }
}
