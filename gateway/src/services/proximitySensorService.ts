import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

export interface RoomSensorConfig {
    iotee: Iotee,
    mqttService: MqttService,
    deviceID: string
}

export enum Mode {
    AUTO,
    MANUAL,
}

const ModeDisplay: { [key in Mode]: string } = {
    [Mode.AUTO]: "AUTO",
    [Mode.MANUAL]: "MANUAL",
};

export class RoomSensorService {
    private mode: Mode;
    private currentProximityLevel: number;

    constructor(private config: RoomSensorConfig) {
        this.mode = Mode.AUTO;
        this.currentProximityLevel = 0;

        setInterval(this.run.bind(this), 1000)

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
                        this.currentProximityLevel += 50;
                    }; break;
                case 'Y':
                    if (this.mode === Mode.MANUAL) {
                        this.currentProximityLevel -= 50;
                    }; break;
                default:
                    console.log("No Function")
            }
        }
        );
    }

    async run() {
        if (this.mode === Mode.AUTO) {
            this.currentProximityLevel = await this.config.iotee.getProximity();
        }

        console.log("result:", this.currentProximityLevel.toFixed(2));

        await this.config.iotee.setDisplay(
            "Proximity Level: \n" + this.currentProximityLevel.toFixed(2) + "\n" + "Mode: " + ModeDisplay[this.mode] + "\n" + "A: switch mode \n" + "X: increase level \n" + "Y: decrease level"
        );

        const topic = "thing/light-sensor/" + this.config.deviceID;
        const message = JSON.stringify({
            proximityLevel: this.currentProximityLevel.toFixed(2),
        });

        this.config.mqttService.publish(topic, message);
    }

}