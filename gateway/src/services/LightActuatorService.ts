import { ReceiveEvents } from "@iotee/node-iotee";
import { ThingConfig } from "../interfaces";

export class LightActuatorService {
  constructor(private config: ThingConfig) {
    const deviceID = process.env.DEVICE_ID!;
    let lightOn = false;

    if (lightOn) {
      this.config.iotee.setDisplay("Light Status: \nON");
    } else {
      this.config.iotee.setDisplay("Light Status: \nOFF");
    }

    this.config.iotee.on(ReceiveEvents.ButtonPressed, async (payload) => {
      if (lightOn) {
        lightOn = false;
        await this.config.iotee.setDisplay("Light Status: \nOFF");
      } else {
        lightOn = true;
        await this.config.iotee.setDisplay("Light Status: \nON");
      }

      const topic = "thing/light-actuator/" + deviceID;
      const message = JSON.stringify({
        lightOn: lightOn,
      });

      console.log("result:", lightOn);
    });
  }
}
