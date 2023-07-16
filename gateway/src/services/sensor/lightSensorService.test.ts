import { Iotee } from "@iotee/node-iotee";
import { Mqtt } from "../../interfaces";
import { MqttService } from "../mqtt";
import { LightSensorService } from "./lightSensorService";

jest.mock("@iotee/node-iotee");

describe("LightSensorService", () => {
  let lightSensorService: LightSensorService;
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
    lightSensorService = new LightSensorService(iotee, mqttService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    lightSensorService.stop();
  });

  it("should return sensor value from getSensorValue method", async () => {
    const lightValue = 50;
    jest.spyOn(iotee, "getLight").mockResolvedValue(lightValue);

    const result = await lightSensorService["getSensorValue"]();

    expect(result).toBe(lightValue);
  });

  it("should return 'lightLevel' as the payload key", () => {
    const payloadKey = lightSensorService.payloadKey;

    expect(payloadKey).toBe("lightLevel");
  });

  it("should return 'Light Level:' as the thing label", () => {
    const thingLabel = lightSensorService.thingLabel;

    expect(thingLabel).toBe("Light Level:");
  });
});
