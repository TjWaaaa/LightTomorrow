import { RoomSensorService } from "./roomSensorService";
import { Iotee } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

jest.mock("@iotee/node-iotee");
jest.mock("./mqtt");

describe("RoomSensorService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should publish the proximity level to MQTT", async () => {
    const getProximityMock = jest
      .spyOn(Iotee.prototype, "getProximity")
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
    const roomSensorService = new RoomSensorService(config);

    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(getProximityMock).toHaveBeenCalled();

    expect(config.iotee.setDisplay).toHaveBeenCalledWith(
      "current proximity level: \n50"
    );

    const expectedTopic = "thing/proximity-sensor/test-device";
    const expectedMessage = JSON.stringify({ proximityLevel: 50 });
    expect(config.mqttService.publish).toHaveBeenCalledWith(
      expectedTopic,
      expectedMessage
    );
  });
});
