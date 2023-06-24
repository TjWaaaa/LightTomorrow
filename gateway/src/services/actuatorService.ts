import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

const DEFAULT_IS_LIGHT_ON = false;

export class LightActuatorService {
  private isLightOn: boolean;

  constructor(private iotee: Iotee, private mqttService: MqttService) {
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