declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEVICE_URL: string;
      DEVICE_TYPE: string;
      DEVICE_ID: string;
      SENSOR_INTERVAL: string;
      MQTT_HOST: string;
      MQTT_PORT: string;
      CA_PATH: string;
      CERT_PATH: string;
      KEY_PATH: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
