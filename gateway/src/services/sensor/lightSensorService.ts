import { SensorService } from "./sensorService";

export class LightSensorService extends SensorService {
  thingLabel = "Light Level:";
  payloadKey = "lightlevel";
  protected async getSensorValue(): Promise<number> {
    return await this.iotee.getLight();
  }
}
