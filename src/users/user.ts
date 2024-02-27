import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());
  let message = "";
  // TODO implement the status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  _user.post("/message", (req, res) => {
    const body = req.body as SendMessageBody;
    message = body.message; 
    console.log(`sending message to user ${body.destinationUserId}`);
  });

  _user.post("/sendMessage", (req, res) => {  
    const body = req.body as SendMessageBody;
    message = body.message;
    res.send({"result":message});
  });

  _user.get("/getLastReceivedMessage", (req, res) => {  
    res.send({"result":message});
  }); 
  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
