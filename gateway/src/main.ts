import { Iotee, LogLevel, ReceiveEvents } from "@iotee/node-iotee";
import { config } from "dotenv";

// Read .env variables
config()

const main = async () => {
  console.log(process.env.DEVICE_URL);
  const iotee = new Iotee(process.env.DEVICE_URL!);
  let counter = 50;

  iotee.setLogLevel(LogLevel.WARN); // Set the verbosity of the API

  await iotee.connect();

  // Do your commands here
  iotee.on(ReceiveEvents.ButtonPressed, async (payload) =>{
      console.log("Button pressed:", payload)
      switch(payload[0]){
      case 'A':
      counter++; break;
      case 'B':
      counter++; break;
      case 'X':
      counter--; break;
      case 'Y':
      counter--; break;
      default:
      console.log("failed")}
  await iotee.setDisplay("current light level: " + counter.toString());
  }
    );
};

main()
  .then(() => {})
  .catch((err) => console.error(err));
