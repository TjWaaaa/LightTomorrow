import * as mqtt from "mqtt";
import { Mqtt } from "../interfaces";
import { MqttService } from "./mqtt";

jest.mock("mqtt");

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("dummyKey"),
}));

const MQTT_CONFIG: Mqtt = {
  host: "localhost",
  port: 1883,
  keyPath: "./path/to/key",
  certPath: "./path/to/cert",
  caPath: "./path/to/ca",
  clientId: "testClient",
  errorCallback: jest.fn(),
};

describe("MqttService", () => {
  let mqttService: MqttService;

  beforeEach(() => {
    mqttService = new MqttService(MQTT_CONFIG);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("connect", () => {
    it("should connect to the broker", async () => {
      // Arange
      let mqttClientMock = {
        on: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn(),
        end: jest.fn(),
      };
      (mqtt.connect as jest.Mock).mockReturnValue(mqttClientMock);
      mqttClientMock.on.mockImplementation((event, callback) => {
        if (event === "connect") {
          callback();
        }
        return mqttClientMock;
      });

      // Act
      await mqttService.connect();

      // Assert
      expect(mqtt.connect).toHaveBeenCalled();
    });

    it("should handle connection error properly", async () => {
      // Arrange
      let mqttClientMock = {
        on: jest.fn(),
        publish: jest.fn(),
        subscribe: jest.fn(),
        end: jest.fn(),
      };
      const error = new Error("Connection error");
      mqttClientMock.on.mockImplementation((event, callback) => {
        if (event === "error") {
          callback(error);
        }
        return mqttClientMock;
      });
      (mqtt.connect as jest.Mock).mockReturnValue(mqttClientMock);

      // Act
      let err;
      try {
        await mqttService.connect();
      } catch (e) {
        err = e;
      }

      // Assert
      expect(err).toBe(error);
      expect(mqttClientMock.on).toHaveBeenCalledWith(
        "error",
        expect.any(Function)
      );
      expect(MQTT_CONFIG.errorCallback).toHaveBeenCalledWith(error);
    });
  });

  describe("publish", () => {
    it("should publish a message to a topic", async () => {
      // Arange
      const publishMock = jest
        .fn()
        .mockImplementation((topic, message, callback) => callback(undefined));
      mqttService["client"] = {
        publish: publishMock,
      } as unknown as mqtt.MqttClient;

      // Act
      mqttService.publish("test-topic", "test-message");

      // Assert
      expect(publishMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("subscribe", () => {
    it("should subscribe to a topic and set up message handler", () => {
      // Arrange
      const subscribeMock = jest
        .fn()
        .mockImplementation((topic, callback) => callback(undefined));
      const onMock = jest.fn().mockImplementation((event, callback) => {
        if (event === "message") {
          callback("test-topic", Buffer.from("test-message"));
        }
      });
      mqttService["client"] = {
        subscribe: subscribeMock,
        on: onMock,
      } as unknown as mqtt.MqttClient;
      const callback = jest.fn();

      // Act
      mqttService.subscribe("test-topic", callback);

      // Assert
      expect(subscribeMock).toHaveBeenCalledTimes(1);
      expect(onMock).toHaveBeenCalledWith("message", expect.any(Function));
      expect(callback).toHaveBeenCalledWith("test-message", "test-topic");
    });
  });

  describe("disconnect", () => {
    it("should disconnect from the broker", () => {
      // Arrange
      const endMock = jest.fn();
      mqttService["client"] = {
        end: endMock,
      } as unknown as mqtt.MqttClient;

      // Act
      mqttService.disconnect();

      // Assert
      expect(endMock).toHaveBeenCalledTimes(1);
    });
  });
});
