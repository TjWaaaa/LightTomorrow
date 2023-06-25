import { SensorService } from "./sensorService";
import { MqttService } from "../mqtt";
import { Iotee, ReceiveEvents } from "@iotee/node-iotee";
import { SensorMode } from "../../interfaces";

jest.mock("@iotee/node-iotee");
jest.mock("../mqtt");

class MockSensorService extends SensorService {
  protected async getSensorValue(): Promise<number> {
    return 100;
  }

  protected getSensorType(): string {
    return "mock-sensor";
  }

  protected getThingLabel(): string {
    return "Mock Sensor:";
  }
}

describe("SensorService", () => {
  let sensorService: MockSensorService;
  let iotee: Iotee;
  let mqttService: MqttService;
  let buttonPressedCallback: (payload: string[]) => void;

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
    buttonPressedCallback = jest.fn();
    (iotee.on as jest.Mock).mockImplementation(
      (event: ReceiveEvents, callback: (payload: string[]) => void) => {
        if (event === ReceiveEvents.ButtonPressed) {
          buttonPressedCallback = callback;
        }
      }
    );
    sensorService = new MockSensorService(iotee, mqttService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should initialize with default values", () => {
    expect(sensorService["mode"]).toBe(SensorMode.AUTO);
    expect(sensorService["currentValue"]).toBe(0);
  });

  it("should switch mode from AUTO to MANUAL on button A press", async () => {
    const buttonAPayload = ["A"];
    sensorService["mode"] = SensorMode.AUTO;

    buttonPressedCallback(buttonAPayload);

    expect(sensorService["mode"]).toBe(SensorMode.MANUAL);
  });

  it("should switch mode from MANUAL to AUTO on button A press", async () => {
    const buttonAPayload = ["A"];
    sensorService["mode"] = SensorMode.MANUAL;

    buttonPressedCallback(buttonAPayload);

    expect(sensorService["mode"]).toBe(SensorMode.AUTO);
  });

  it("should increase currentValue on button X press in MANUAL mode", async () => {
    const buttonXPayload = ["X"];
    sensorService["mode"] = SensorMode.MANUAL;
    const originalValue = sensorService["currentValue"];

    buttonPressedCallback(buttonXPayload);

    expect(sensorService["currentValue"]).toBe(originalValue + 50);
  });

  it("should decrease currentValue on button Y press in MANUAL mode", async () => {
    const buttonYPayload = ["Y"];
    sensorService["mode"] = SensorMode.MANUAL;
    const originalValue = sensorService["currentValue"];

    buttonPressedCallback(buttonYPayload);

    expect(sensorService["currentValue"]).toBe(originalValue - 50);
  });

  it("should update display and publish message on run", async () => {
    const mockSetDisplay = jest.spyOn(iotee, "setDisplay");
    const mockPublish = jest.spyOn(mqttService, "publish");

    await sensorService.run();

    expect(mockSetDisplay).toHaveBeenCalledWith(
      "Mock Sensor:\n100.00\nMode: AUTO\nA: switch mode \nX: increase value \nY: decrease value"
    );

    expect(mockPublish).toHaveBeenCalledWith(
      "thing/mock-sensor/undefined",
      JSON.stringify({
        sensorValue: "100.00",
      })
    );
  });
});
