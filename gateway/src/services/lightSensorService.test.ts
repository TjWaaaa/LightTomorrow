import { LightSensorService } from "./lightSensorService";
import { Iotee } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

jest.mock("@iotee/node-iotee");
jest.mock("./mqtt");

describe("LightSensorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should publish the light level to MQTT", async () => {
    const getLightMock = jest
      .spyOn(Iotee.prototype, "getLight")
      .mockResolvedValue(50);

    const mqttServiceMock = new MqttService({
      host: "test.test.com",
      port: 1234,
      caPath: "ca/path",
      certPath: "cert/path",
      keyPath: "key/path",
      clientId: "client/id",
    });
    const config = {
      iotee: new Iotee("test"),
      mqttService: mqttServiceMock,
      deviceID: "test-device",
    };
    const lightSensorService = new LightSensorService(config);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(getLightMock).toHaveBeenCalled();

    expect(config.iotee.setDisplay).toHaveBeenCalledWith(
      "current light level: \n50"
    );

    const expectedTopic = "thing/light-sensor/test-device";
    const expectedMessage = JSON.stringify({ lightLevel: 50 });
    expect(config.mqttService.publish).toHaveBeenCalledWith(
      expectedTopic,
      expectedMessage
    );
  });
});
