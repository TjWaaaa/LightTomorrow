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

  constructor(protected iotee: Iotee, protected mqttService: MqttService) {
    this.mode = DEFAULT_MODE;
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

    this.run()
  }

  async run() {
    if (this.mode === SensorMode.AUTO) {
      this.currentValue = await this.getSensorValue();
    }

    console.log("Current Value:", this.currentValue.toFixed(2));

    await this.updateDisplay();

    const topic = "thing/" + this.getSensorType() + "/" + DEVICE_ID;

    const message = JSON.stringify({
      sensorValue: this.currentValue.toFixed(2),
    });
    this.mqttService.publish(topic, message);

    // This is better than setInterval because it will wait for the previous
    setTimeout(() => this.run(), INTERVAL)
  }

  private async updateDisplay() {
    const displayMessage = this.getThingLabel() +
      "\n" +
      this.currentValue.toFixed(2) +
      "\n" +
      "Mode: " +
      this.mode +
      "\n" +
      "A: switch mode \n" +
      "X: increase value \n" +
      "Y: decrease value";

    await this.iotee.setDisplay(displayMessage);
  }

  protected abstract getSensorValue(): Promise<number>;
  protected abstract getSensorType(): string;
  protected abstract getThingLabel(): string;
}
