import { SensorService } from "./sensorService";

export class ProximitySensorService extends SensorService {
  thingLabel = "Proximity Level:";
  payloadKey = "proximity";
  protected async getSensorValue(): Promise<number> {
    return await this.iotee.getProximity();
  }
}
