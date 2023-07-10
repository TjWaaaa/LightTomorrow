// Declare and export the constants
export const MOCKED_DEVICE_ID = "sensor_testing";
export const DEVICE_URL = "/dev/tty.testing";
export const DEVICE_TYPE = "LightActuator";
export const SENSOR_INTERVAL = "1000";
export const MQTT_HOST = "host.amazonaws.com";
export const MQTT_PORT = "8883";
export const CA_PATH = "../packages/root-CA.crt";
export const CERT_PATH = `../packages/${MOCKED_DEVICE_ID}/certificate.pem.crt`;
export const KEY_PATH = `../packages/${MOCKED_DEVICE_ID}/private.pem.key`;

// Set up the environment variables
process.env.DEVICE_ID = MOCKED_DEVICE_ID;
process.env.DEVICE_URL = DEVICE_URL;
process.env.DEVICE_TYPE = DEVICE_TYPE;

process.env.SENSOR_INTERVAL = SENSOR_INTERVAL;

process.env.MQTT_HOST = MQTT_HOST;
process.env.MQTT_PORT = MQTT_PORT;

process.env.CA_PATH = CA_PATH;
process.env.CERT_PATH = CERT_PATH;
process.env.KEY_PATH = KEY_PATH;
