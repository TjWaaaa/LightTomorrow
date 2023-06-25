import { SensorService } from "./sensorService";

export class LightSensorService extends SensorService {
  thingLabel = "Light Level:";
  protected async getSensorValue(): Promise<number> {
    return await this.iotee.getLight();
  }
}
