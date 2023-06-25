import { MqttService } from "../mqtt";
import { ProximitySensorService } from "./proximitySensorService";
import { Iotee } from "@iotee/node-iotee";

jest.mock("@iotee/node-iotee");

describe("ProximitySensorService", () => {
  let proximitySensorService: ProximitySensorService;
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
    proximitySensorService = new ProximitySensorService(iotee, mqttService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return sensor value from getProximity method", async () => {
    const proximityValue = 50;
    jest.spyOn(iotee, "getProximity").mockResolvedValue(proximityValue);

    const result = await proximitySensorService["getSensorValue"]();

    expect(result).toBe(proximityValue);
  });

  it("should return 'proximity-sensor' as the sensor type", () => {
    const sensorType = proximitySensorService["getSensorType"]();

    expect(sensorType).toBe("proximity-sensor");
  });

  it("should return 'Proximity Level:' as the thing label", () => {
    const thingLabel = proximitySensorService["getThingLabel"]();

    expect(thingLabel).toBe("Proximity Level:");
  });
});
