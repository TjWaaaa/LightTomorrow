import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

export interface LightSensorConfig {
    iotee: Iotee;
    mqttService: MqttService;
    deviceID: string;
}

export enum Mode {
    AUTO,
    MANUAL,
}

const ModeDisplay: { [key in Mode]: string } = {
    [Mode.AUTO]: "AUTO",
    [Mode.MANUAL]: "MANUAL",
};

export class LightSensorService {
    private mode: Mode;
    private currentLightLevel: number;

    constructor(private config: LightSensorConfig) {
        this.mode = Mode.AUTO;
        this.currentLightLevel = 0;

        const run = async () => {
            if (this.mode === Mode.AUTO) {
                this.currentLightLevel = await this.config.iotee.getLight();
            }

            console.log("result:", this.currentLightLevel.toFixed(2));

            await this.config.iotee.setDisplay(
                "Light Level: \n" + this.currentLightLevel.toFixed(2) + "\n" + "Mode: " + ModeDisplay[this.mode] + "\n" + "A: switch mode \n" + "X: increase level \n" + "Y: decrease level"
            );

            const topic = "thing/light-sensor/" + this.config.deviceID;
            const message = JSON.stringify({
                lightLevel: this.currentLightLevel.toFixed(2),
            });

            this.config.mqttService.publish(topic, message);
        };

        setInterval(run, 1000);

        this.config.iotee.on(ReceiveEvents.ButtonPressed, async (payload) => {
            console.log("Button pressed:", payload)
            switch (payload[0]) {
                case 'A':
                    if (this.mode === Mode.AUTO) {
                        this.mode = Mode.MANUAL;
                        console.log("MANUAL MODE")
                    } else if (this.mode === Mode.MANUAL) {
                        this.mode = Mode.AUTO;
                        console.log("AUTO MODE")
                    }; break;
                case 'X':
                    if (this.mode === Mode.MANUAL) {
                        this.currentLightLevel += 50;
                    }; break;
                case 'Y':
                    if (this.mode === Mode.MANUAL) {
                        this.currentLightLevel -= 50;
                    }; break;
                default:
                    console.log("No Function")
            }
        }
        );
    }





}
