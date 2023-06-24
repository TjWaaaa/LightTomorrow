import { SensorService } from "./sensorService";

export class LightSensorService extends SensorService {
  protected async getSensorValue(): Promise<number> {
    return await this.iotee.getLight();
  }

  protected getSensorType(): string {
    return "light-sensor";
  }

  protected getThingLabel(): string {
    return "Light Level:";
  }
}
