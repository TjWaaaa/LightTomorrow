import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { Thing } from "../interfaces";
import { MqttService } from "./mqtt";

const DEFAULT_IS_LIGHT_ON = false;

export class LightActuatorService {
  private deviceID: string; // TODO: ensure this is used in topic later or get removed
  private isLightOn: boolean;
  private iotee: Iotee;
  private mqttService: MqttService;

  constructor(config: Thing) {
    this.iotee = config.iotee;
    this.mqttService = config.mqttService;

    this.deviceID = process.env.DEVICE_ID;
    this.isLightOn = DEFAULT_IS_LIGHT_ON;

    this.setup();
  }

  async setup() {
    await this.setDisplayLightStatus();

    this.mqttService.subscribe("topic", (payload, topic) => {
      this.isLightOn = JSON.parse(payload).lightStatusParse; // This logic will be changed after final terraform
      this.setDisplayLightStatus();
    });

    this.iotee.on(ReceiveEvents.ButtonPressed, async () => {
      this.isLightOn = !this.isLightOn;
      this.setDisplayLightStatus();
    });
  }

  private async setDisplayLightStatus() {
    await this.iotee.setDisplay(
      `Light Status: \n${this.isLightOn ? "ON" : "OFF"}`
    );
  }
}
