import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

export interface LightActuatorConfig {
    iotee: Iotee,
    mqttService: MqttService,
    deviceID: string
}

export class LightActuatorService {
    constructor(private config: LightActuatorConfig) {

        let lightOn = false;
        this.config.iotee.on(ReceiveEvents.ButtonPressed, async (payload) => {
            console.log("Button pressed:", payload)
            switch (payload[0]) {
                case 'A':
                    lightOn = true; break;
                case 'B':
                    lightOn = false; break;
                default:
                    console.log("No Function")
            }
            await this.config.iotee.setDisplay("Light: " + lightOn.toString());

        }
        );

        console.log("result:", lightOn);

    }

}