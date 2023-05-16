import { Iotee, LogLevel } from "@iotee/node-iotee";
import { config } from "dotenv";

// Read .env variables
config()

const main = async () => {
  const iotee = new Iotee(process.env.DEVICE_URL!);

  iotee.setLogLevel(LogLevel.WARN); // Set the verbosity of the API

  await iotee.connect();

  // Do your commands here
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
