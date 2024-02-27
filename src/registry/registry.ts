import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import * as crypto from "../crypto";  
export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());
  let Nodes = [] as Node[];
  let Nodeid = 0; 
  _registry.post("/registerNode", async (req: Request, res: Response) => {
    const body = req.body as RegisterNodeBody;
    const key = await crypto.generateRsaKeyPair();
    Nodes.push({ nodeId: body.nodeId, pubKey:key.publicKey.toString() }); 
    console.log(`registering node ${body.nodeId}`);
    res.send({"result":key.publicKey});
  });

  _registry.get("/getPrivateKey", (req, res) => { 
    res.send({"result":Nodes[0].pubKey}); 
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    res.send({"result":Nodes});
  });
    // TODO implement the status route
  _registry.get("/status", (req, res) => {
    res.send("live"); 
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
