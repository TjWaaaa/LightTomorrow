import { SensorService } from "./sensorService";

export class ProximitySensorService extends SensorService {
  thingLabel = "Proximity Level:";
  protected async getSensorValue(): Promise<number> {
    return await this.iotee.getProximity();
  }
}
