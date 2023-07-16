import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { config } from "dotenv";
import { RGBAColor } from "../interfaces";
import { MqttService } from "./mqtt";

const DEFAULT_IS_LIGHT_ON = false;

const RGBA_ON = [0, 255, 0, 255] satisfies RGBAColor;
const RGBA_OFF = [255, 0, 0, 255] satisfies RGBAColor;

const ACTUATOR_TOPIC = "topic/actuator/light";

config();

const DEVICE_ID = process.env.DEVICE_ID!;

export class LightActuatorService {
  private isLightOn: boolean;

  constructor(private iotee: Iotee, private mqttService: MqttService) {
    this.isLightOn = DEFAULT_IS_LIGHT_ON;

    this.setup();
  }

  async setup() {
    await this.setDisplayLightStatus();

    /* istanbul ignore next */
    this.mqttService.subscribe(ACTUATOR_TOPIC, (payload, topic) => {
      this.handleMqttMessage(payload);
    });

    this.iotee.on(ReceiveEvents.ButtonPressed, async () => {
      this.isLightOn = !this.isLightOn;
      this.setDisplayLightStatus();
    });
  }

  private handleMqttMessage(payload: string) {
    const payloadParsed = JSON.parse(payload);
    if (!DEVICE_ID.includes(payloadParsed.payload.detector.keyValue)) {
      return;
    }
    console.log("Light is: ", payloadParsed.payload.state.stateName);
    this.isLightOn =
      (payloadParsed.payload.state.stateName as "light_off" | "light_on") ===
      "light_off"
        ? false
        : true;
    this.setDisplayLightStatus();
  }

  private async setDisplayLightStatus() {
    let ledColors: RGBAColor;
    if (this.isLightOn) {
      ledColors = RGBA_ON;
    } else {
      ledColors = RGBA_OFF;
    }

    try {
      await this.iotee.setLED(...ledColors);
      await this.iotee.setDisplay(
        `Light Status: \n${this.isLightOn ? "ON" : "OFF"}`
      );
    } catch (error) {
      /* istanbul ignore next */
      console.error("Display device failed", error);
    }
  }
}
