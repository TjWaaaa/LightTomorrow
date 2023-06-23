import { Iotee } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

export interface LightSensorConfig {
  iotee: Iotee;
  mqttService: MqttService;
  deviceID: string;
}

export class LightSensorService {
  constructor(private config: LightSensorConfig) {
    const run = async () => {
      const result = await this.config.iotee.getLight();

      console.log("result:", result);

      await this.config.iotee.setDisplay(
        "current light level: \n" + result.toString()
      );

      const topic = "thing/light-sensor/" + this.config.deviceID;
      const message = JSON.stringify({
        lightLevel: result,
      });

      this.config.mqttService.publish(topic, message);
    };

    setInterval(run, 1000);
  }
}
