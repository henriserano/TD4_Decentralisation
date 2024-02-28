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
    Nodes.push({ nodeId: body.nodeId, pubKey:body.pubKey }); 
    console.log(`registering node ${body.nodeId}`);
    res.send({"result":body.pubKey});
  });

  _registry.get("/getPrivateKey", (req, res) => { 
    res.send({"result":Nodes[Nodes.length-1].pubKey}); 
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
