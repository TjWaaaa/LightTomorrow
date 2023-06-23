import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

export interface RoomSensorConfig {
    iotee: Iotee,
    mqttService: MqttService,
    deviceID: string
}

export class RoomSensorService {
    constructor(private config: RoomSensorConfig) {

    const run = async () => {
        const result = await this.config.iotee.getProximity()
    
        console.log("result:", result);
    
        await this.config.iotee.setDisplay("current Proximity: \n" + result.toString());
      }
    
      setInterval(run, 1000);
}

}