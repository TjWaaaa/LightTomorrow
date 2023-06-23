import {
  LightActuatorService,
  LightActuatorConfig,
} from "./lightActuatorService";
import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { MqttService } from "./mqtt";

jest.mock("@iotee/node-iotee");
jest.mock("./mqtt");

describe("LightActuatorService", () => {
  let ioteeMock: jest.Mocked<Iotee>;
  let mqttServiceMock: jest.Mocked<MqttService>;
  let config: LightActuatorConfig;

  beforeEach(() => {
    ioteeMock = {
      on: jest.fn(),
      setDisplay: jest.fn(),
    } as unknown as jest.Mocked<Iotee>;

    mqttServiceMock = {} as jest.Mocked<MqttService>;

    config = {
      iotee: ioteeMock,
      mqttService: mqttServiceMock,
      deviceID: "mockDeviceID",
    };
  });

  it("should turn on the light when 'A' button is pressed", async () => {
    const lightActuatorService = new LightActuatorService(config);
    const buttonPressedPayload = ["A"];

    ioteeMock.on.mock.calls[0][1](buttonPressedPayload);

    expect(ioteeMock.setDisplay).toHaveBeenCalledWith("Light: true");
  });

  it("should turn off the light when 'B' button is pressed", async () => {
    const lightActuatorService = new LightActuatorService(config);
    const buttonPressedPayload = ["B"];

    ioteeMock.on.mock.calls[0][1](buttonPressedPayload);

    expect(ioteeMock.setDisplay).toHaveBeenCalledWith("Light: false");
  });

  it("should do nothing when an unsupported button is pressed", async () => {
    const lightActuatorService = new LightActuatorService(config);
    const buttonPressedPayload = ["C"];

    ioteeMock.on.mock.calls[0][1](buttonPressedPayload);

    expect(ioteeMock.setDisplay).toHaveBeenCalledWith("Light: false");
    expect(ioteeMock.setDisplay).toHaveBeenCalledTimes(1);
  });
});
