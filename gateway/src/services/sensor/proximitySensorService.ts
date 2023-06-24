import { SensorService } from "./sensorService";

export class ProximitySensorService extends SensorService {
  protected async getSensorValue(): Promise<number> {
    return await this.iotee.getProximity();
  }

  protected getSensorType(): string {
    return "proximity-sensor";
  }

  protected getThingLabel(): string {
    return "Proximity Level:";
  }
}
