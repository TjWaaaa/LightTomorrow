import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { MOCKED_DEVICE_ID } from "../../jestEnv";
import { LightActuatorService } from "./actuatorService";
import { MqttService } from "./mqtt";

jest.mock("@iotee/node-iotee");
jest.mock("./mqtt");

describe("LightActuatorService", () => {
  let actuatorService: LightActuatorService;
  let iotee: Iotee;
  let mqttService: MqttService;
  let buttonPressedCallback: () => void;
  let subscribeCallback: (payload: string, topic: string) => void;
  let mockSetLED: jest.Mock;
  let mockSetDisplay: jest.Mock;

  beforeEach(() => {
    iotee = new Iotee("test");
    const mqttConfig = {
      host: "test.com",
      port: 1234,
      caPath: "test",
      certPath: "test",
      keyPath: "test",
      clientId: "test",
      errorCallback: jest.fn(),
    };
    mqttService = new MqttService(mqttConfig);
    buttonPressedCallback = jest.fn();
    subscribeCallback = jest.fn();
    (iotee.on as jest.Mock).mockImplementation(
      (event: ReceiveEvents, callback: () => void) => {
        if (event === ReceiveEvents.ButtonPressed) {
          buttonPressedCallback = callback;
        }
      }
    );
    (mqttService.subscribe as jest.Mock).mockImplementation(
      (topic: string, callback: (payload: string) => void) => {
        subscribeCallback = (payload: string, receivedTopic: string) => {
          if (receivedTopic === topic) {
            callback(payload);
          }
        };
      }
    );
    mockSetLED = jest.fn();
    mockSetDisplay = jest.fn();
    (iotee.setLED as jest.Mock).mockImplementation(mockSetLED);
    (iotee.setDisplay as jest.Mock).mockImplementation(mockSetDisplay);

    actuatorService = new LightActuatorService(iotee, mqttService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should initialize with default values", () => {
    expect(actuatorService["isLightOn"]).toBe(false);
  });

  it("should toggle light on button press", () => {
    actuatorService["isLightOn"] = false;

    buttonPressedCallback();

    expect(actuatorService["isLightOn"]).toBe(true);

    buttonPressedCallback();

    expect(actuatorService["isLightOn"]).toBe(false);
  });

  it("should set isLightOn and call setDisplayLightStatus", () => {
    const setDisplayLightStatusSpy = jest.spyOn<any, any>(
      actuatorService,
      "setDisplayLightStatus"
    );
    const mockGetLightPayloadOn = JSON.stringify({
      payload: {
        detector: { keyValue: MOCKED_DEVICE_ID },
        state: { stateName: "LightOn" },
      },
    });

    const mockGetLightPayloadOff = JSON.stringify({
      payload: {
        detector: { keyValue: MOCKED_DEVICE_ID },
        state: { stateName: "LightOff" },
      },
    });

    actuatorService["handleMqttMessage"](mockGetLightPayloadOn);

    expect(actuatorService["isLightOn"]).toBe(true);
    expect(setDisplayLightStatusSpy).toBeCalledTimes(1);

    actuatorService["handleMqttMessage"](mockGetLightPayloadOff);

    expect(actuatorService["isLightOn"]).toBe(false);
    expect(setDisplayLightStatusSpy).toBeCalledTimes(2);
  });

  it("should not set isLightOn and call setDisplayLightStatus with wrong device id", () => {
    const setDisplayLightStatusSpy = jest.spyOn<any, any>(
      actuatorService,
      "setDisplayLightStatus"
    );
    const mockGetLightPayloadOn = JSON.stringify({
      payload: {
        detector: { keyValue: "banana" },
        state: { stateName: "LightOn" },
      },
    });

    actuatorService["handleMqttMessage"](mockGetLightPayloadOn);

    expect(actuatorService["isLightOn"]).toBe(false);
    expect(setDisplayLightStatusSpy).not.toBeCalled();
  });

  it("should update display and LED color correctly", async () => {
    expect(mockSetLED).toHaveBeenCalledWith(255, 0, 0, 255);
    expect(mockSetDisplay).toHaveBeenCalledWith("Light Status: \nOFF");

    actuatorService["isLightOn"] = true;
    await actuatorService["setDisplayLightStatus"]();

    expect(mockSetLED).toHaveBeenCalledWith(0, 255, 0, 255);
    expect(mockSetDisplay).toHaveBeenCalledWith("Light Status: \nON");

    actuatorService["isLightOn"] = false;
    await actuatorService["setDisplayLightStatus"]();

    expect(mockSetLED).toHaveBeenCalledWith(255, 0, 0, 255);
    expect(mockSetDisplay).toHaveBeenCalledWith("Light Status: \nOFF");
  });
});
