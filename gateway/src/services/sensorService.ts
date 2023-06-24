import { ReceiveEvents } from "@iotee/node-iotee";
import { SensorMode, Thing } from "../interfaces";

export abstract class SensorService {
  protected mode: SensorMode;
  protected currentValue: number;
  protected interval = parseInt(process.env.SENSOR_INTERVAL!, 10);

  constructor(protected config: Thing) {
    this.mode = SensorMode.AUTO;
    this.currentValue = 0;
    const deviceID = process.env.DEVICE_ID!;

    const run = async () => {
      if (this.mode === SensorMode.AUTO) {
        this.currentValue = await this.getSensorValue();
      }

      console.log("result:", this.currentValue.toFixed(2));

      await this.config.iotee.setDisplay(
        this.getThingLabel() +
          "\n" +
          this.currentValue.toFixed(2) +
          "\n" +
          "Mode: " +
          this.mode +
          "\n" +
          "A: switch mode \n" +
          "X: increase value \n" +
          "Y: decrease value"
      );

      const topic = "thing/" + this.getSensorType() + "/" + deviceID;
      const message = JSON.stringify({
        sensorValue: this.currentValue.toFixed(2),
      });

      this.config.mqttService.publish(topic, message);
    };

    setInterval(run, this.interval);

    this.config.iotee.on(ReceiveEvents.ButtonPressed, async (payload) => {
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
            this.currentValue += 50;
          }
          break;
        case "Y":
          if (this.mode === SensorMode.MANUAL) {
            this.currentValue -= 50;
          }
          break;
        default:
          console.log("No Function");
      }
    });
  }

  protected abstract getSensorValue(): Promise<number>;
  protected abstract getSensorType(): string;
  protected abstract getThingLabel(): string;
}

export class LightSensorService extends SensorService {
  protected async getSensorValue(): Promise<number> {
    return await this.config.iotee.getLight();
  }

  protected getSensorType(): string {
    return "light-sensor";
  }

  protected getThingLabel(): string {
    return "Light Level:";
  }
}

export class ProximitySensorService extends SensorService {
  protected async getSensorValue(): Promise<number> {
    return await this.config.iotee.getProximity();
  }

  protected getSensorType(): string {
    return "proximity-sensor";
  }

  protected getThingLabel(): string {
    return "Proximity Level:";
  }
}
