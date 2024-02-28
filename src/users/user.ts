import express from "express";
import fetch from 'node-fetch'; // Si vous utilisez ES6 et node-fetch v3 ou supérieur
import { BASE_ONION_ROUTER_PORT, BASE_USER_PORT, REGISTRY_PORT } from "../config";
import * as crypto from "../crypto"; // Assurez-vous que le chemin d'importation est correct

const bodyParser = require('body-parser');

async function getNodePublicKey(nodeId: any) {
  // Implémentation d'exemple - Adaptez selon votre logique d'application
  const registryUrl = `http://localhost:${REGISTRY_PORT}/getNodeRegistry`;
  const response = await fetch(registryUrl);
  const { nodes } = await response.json();
  const node = nodes.find((n: { nodeId: any; }) => n.nodeId === nodeId);
  return node ? node.pubKey : null;
}

async function getCircuit() {
  const registryUrl = `http://localhost:${REGISTRY_PORT}/getNodeRegistry`;
  const response = await fetch(registryUrl);
  const { nodes } = await response.json();
  let circuit: any[] = [];
  while (circuit.length < 3) {
    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (!circuit.find(node => node.nodeId === randomNode.nodeId)) {
      circuit.push(randomNode);
    }
  }
  return circuit.map(node => node.nodeId); // Retourne uniquement les IDs des nœuds
}

async function encryptMessageLayers(message: any, circuit: string | any[]) {
  let encryptedMessage = message;
  for (let i = circuit.length - 1; i >= 0; i--) {
    const nodePubKey = await getNodePublicKey(circuit[i]);
    encryptedMessage = await crypto.rsaEncrypt(encryptedMessage, nodePubKey);
  }
  return encryptedMessage;
}

async function transferMessageToNode(firstNodeId: any, encryptedMessage: any, destinationUserId: any) {
  const nodeUrl = `http://localhost:${BASE_ONION_ROUTER_PORT + firstNodeId}/relayMessage`;
  await fetch(nodeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: encryptedMessage,
      nextNodeId: destinationUserId,
    }),
  });
}

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  _user.get("/status", (req, res) => res.send("live"));
  _user.get('/getLastReceivedMessage', (req, res) => res.json({ result: lastReceivedMessage }));
  _user.get('/getLastSentMessage', (req, res) => res.json({ result: lastSentMessage }));

  _user.post("/sendMessage", async (req, res) => {
    const { message, destinationUserId } = req.body;
    const circuit = await getCircuit();
    const encryptedMessage = await encryptMessageLayers(message, circuit);
    await transferMessageToNode(circuit[0], encryptedMessage, destinationUserId);
    lastSentMessage = message; // Mettre à jour le dernier message envoyé
    res.send("Message sent successfully");
  });

  _user.post("/message", (req, res) => {
    lastReceivedMessage = req.body.message;
    res.status(200).send("success");
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}
