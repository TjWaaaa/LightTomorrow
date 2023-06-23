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
                await this.config.iotee.setDisplay("Light Status: \nON")
            }

            const topic = "thing/light-actuator/" + this.config.deviceID;
            const message = JSON.stringify({
                lightOn: lightOn,
            });

            console.log("result:", lightOn);

        }

        );
    }
}