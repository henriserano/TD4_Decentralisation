import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: string | null = null;
  let lastReceivedMessage: string | null = null; // For users
  let lastSentMessage: string | null = null; // For users

  // TODO implement the status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });
  onionRouter.get('/getLastReceivedEncryptedMessage' , (req, res) => {
    res.send({"result":lastReceivedEncryptedMessage});
  });


  onionRouter.get('/getLastReceivedDecryptedMessage' , (req, res) => {
    res.send({"result":lastReceivedDecryptedMessage});
  });

  onionRouter.get('/getLastMessageDestination' , (req, res) => {
    res.send({"result":lastMessageDestination});
  });

  onionRouter.get('/getLastReceivedMessage' , (req, res) => {
    res.send({"result":lastReceivedMessage});
  });

  onionRouter.get('/getLastSentMessage' , (req, res) => {
    res.send({"result":lastSentMessage});
  });

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
