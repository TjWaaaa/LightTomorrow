import { MqttService } from "../mqtt";
import { LightSensorService } from "./lightSensorService";
import { Iotee } from "@iotee/node-iotee";

jest.mock("@iotee/node-iotee");

describe("LightSensorService", () => {
  let lightSensorService: LightSensorService;
  let iotee: Iotee;
  let mqttService: MqttService;

  beforeEach(() => {
    iotee = new Iotee("test");
    mqttService = new MqttService({
      host: "test.com",
      port: 1234,
      caPath: "test",
      certPath: "test",
      keyPath: "test",
      clientId: "test",
    });
    lightSensorService = new LightSensorService(iotee, mqttService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return sensor value from getLight method", async () => {
    const lightValue = 50;
    jest.spyOn(iotee, "getLight").mockResolvedValue(lightValue);

    const result = await lightSensorService["getSensorValue"]();

    expect(result).toBe(lightValue);
  });

  it("should return 'light-sensor' as the sensor type", () => {
    const sensorType = lightSensorService["getSensorType"]();

    expect(sensorType).toBe("light-sensor");
  });

  it("should return 'Light Level:' as the thing label", () => {
    const thingLabel = lightSensorService["getThingLabel"]();

    expect(thingLabel).toBe("Light Level:");
  });
});
