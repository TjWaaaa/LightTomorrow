import { Iotee } from "@iotee/node-iotee";
import { Mqtt } from "../../interfaces";
import { MqttService } from "../mqtt";
import { ProximitySensorService } from "./proximitySensorService";

jest.mock("@iotee/node-iotee");

describe("ProximitySensorService", () => {
  let proximitySensorService: ProximitySensorService;
  let iotee: Iotee;
  let mqttService: MqttService;

  beforeEach(() => {
    iotee = new Iotee("test");
    const mqttConfig: Mqtt = {
      host: "test.com",
      port: 1234,
      caPath: "test",
      certPath: "test",
      keyPath: "test",
      clientId: "test",
      errorCallback: function (error: Error): void {
        console.log("Error callback");
      },
    };
    mqttService = new MqttService(mqttConfig);
    proximitySensorService = new ProximitySensorService(iotee, mqttService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    proximitySensorService.stop();
  });

  it("should return sensor value from getSensorValue method", async () => {
    const proximityValue = 50;
    jest.spyOn(iotee, "getProximity").mockResolvedValue(proximityValue);

    const result = await proximitySensorService["getSensorValue"]();

    expect(result).toBe(proximityValue);
  });

  it("should return 'proximity' as the payload key", () => {
    const sensorType = proximitySensorService.payloadKey;

    expect(sensorType).toBe("proximity");
  });

  it("should return 'Proximity Level:' as the thing label", () => {
    const thingLabel = proximitySensorService.thingLabel;

    expect(thingLabel).toBe("Proximity Level:");
  });
});
