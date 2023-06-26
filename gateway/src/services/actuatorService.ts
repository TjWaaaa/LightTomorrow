import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { config } from "dotenv";
import { RGBAColor } from "../interfaces";
import { MqttService } from "./mqtt";

const DEFAULT_IS_LIGHT_ON = false;

const RGBA_ON = [0, 255, 0, 255] satisfies RGBAColor;
const RGBA_OFF = [255, 0, 0, 255] satisfies RGBAColor;

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

    this.mqttService.subscribe("topic/actuator/light", (payload, topic) => {
      const payloadParsed = JSON.parse(payload);
      if (payloadParsed.payload.detector.keyValue != DEVICE_ID) {
        console.log("no this device");
        return;
      }
      console.log("Light is: ", payloadParsed.payload.state.stateName);
      this.isLightOn =
        (payloadParsed.payload.state.stateName as "LightOff" | "LightOn") ===
        "LightOff"
          ? false
          : true;
      this.setDisplayLightStatus();
    });

    this.iotee.on(ReceiveEvents.ButtonPressed, async () => {
      this.isLightOn = !this.isLightOn;
      this.setDisplayLightStatus();
    });
  }

  private async setDisplayLightStatus() {
    let ledColors: RGBAColor;
    if (this.isLightOn) {
      ledColors = RGBA_ON;
    } else {
      ledColors = RGBA_OFF;
    }

    await this.iotee.setLED(...ledColors);
    await this.iotee.setDisplay(
      `Light Status: \n${this.isLightOn ? "ON" : "OFF"}`
    );
  }
}

// {
//   "eventTime": 1687777879777,
//   "payload": {
//     "actionExecutionId": "5376658b-d94a-369a-9482-ba6a0c0eaf1a",
//     "detector": {
//       "detectorModelName": "LightActuatorModel",
//       "keyValue": "thing_actuator_light_workplace_1",
//       "detectorModelVersion": "3"
//     },
//     "eventTriggerDetails": {
//       "inputName": "lightSensor",
//       "messageId": "5e4a6bd1-7d38-462a-92fd-160c3182a550",
//       "triggerType": "Message"
//     },
//     "state": {
//       "stateName": "LightOff",
//       "variables": {},
//       "timers": {}
//     }
//   },
//   "eventName": "TurnOffLight"
// }
