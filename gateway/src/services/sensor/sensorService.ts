import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { config } from "dotenv";
import { SensorMode } from "../../interfaces";
import { MqttService } from "../mqtt";

const STEP_SIZE_MANUAL_MODE = 50;
const DEFAULT_MODE = SensorMode.AUTO;
const DEFAULT_INTERVAL = 1000;

config();

const INTERVAL = parseInt(process.env.SENSOR_INTERVAL!) || DEFAULT_INTERVAL;
const DEVICE_ID = process.env.DEVICE_ID!;

export abstract class SensorService {
  protected mode: SensorMode;
  protected currentValue: number;
  protected isRunning: boolean;
  abstract thingLabel: string;
  abstract payloadKey: string;

  constructor(protected iotee: Iotee, protected mqttService: MqttService) {
    this.mode = DEFAULT_MODE;
    this.isRunning = false;
    this.currentValue = 0;

    this.setup();
  }

  async setup() {
    this.iotee.on(ReceiveEvents.ButtonPressed, async (payload) => {
      console.log("Button pressed:", payload);
      switch (payload[0]) {
        case "A":
          if (this.mode === SensorMode.AUTO) {
            this.mode = SensorMode.MANUAL;
            console.log("MANUAL MODE");
          } else if (this.mode === SensorMode.MANUAL) {
            this.mode = SensorMode.AUTO;
            console.log("AUTO MODE");
          }
          break;
        case "X":
          if (this.mode === SensorMode.MANUAL) {
            this.currentValue += STEP_SIZE_MANUAL_MODE;
          }
          break;
        case "Y":
          if (this.mode === SensorMode.MANUAL) {
            this.currentValue -= STEP_SIZE_MANUAL_MODE;
          }
          break;
      }
      await this.updateDisplay();
    });
    this.start();
  }

  async run() {
    try {
      if (this.mode === SensorMode.AUTO) {
        this.currentValue = await this.getSensorValue();
      }
    } catch (error) {
      console.log("Error getting sensor value:", error);
    }

    console.log(
      "Current Value:",
      this.currentValue ? this.currentValue.toFixed(2) : ""
    );

    await this.updateDisplay();

    const topic = "topic/sensor/" + DEVICE_ID;

    const message = JSON.stringify({
      [this.payloadKey]: Math.floor(this.currentValue),
    });
    this.mqttService.publish(topic, message);

    if (this.isRunning) {
      setTimeout(() => this.run(), INTERVAL);
    }
  }

  private async updateDisplay() {
    const displayMessage =
      this.thingLabel +
      "\n" +
      (this.currentValue ? this.currentValue.toFixed(2) : "") +
      "\n" +
      "Mode: " +
      this.mode +
      "\n" +
      "A: switch mode \n" +
      "X: increase value \n" +
      "Y: decrease value";

    try {
      await this.iotee.setDisplay(displayMessage);
    } catch (error) {
      console.log("Display device failed", error);
    }
  }

  start() {
    this.isRunning = true;
    this.run();
  }

  stop() {
    this.isRunning = false;
  }

  protected abstract getSensorValue(): Promise<number>;
}
