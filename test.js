import fs from "fs";
import bencode from "bencode";

import dgram from "dgram"; // the module for UDP (user datagram protocol)
import {Buffer} from "buffer";
import { parse as urlParse } from "url"; // Help me to extract different parts of the URL like the protocol port, hostname...

// 1. Decode the torrent file
const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));
const announceUrl = torrent.announce.toString('utf8');

// 2. Make sure its a UDP Tracker
if(!announceUrl.startsWith("udp://")) {
    throw new Error("this tracker does not use UDP: "+ announceUrl);
}

// 3. parse the URL
const url = urlParse(announceUrl) 

// 4. Extract port and host safely
const port = url.port ? parseInt(url.port, 10): 80;
const host = url.hostname || url.host;

if(!host) {
    throw new Error("Tracker hostname is missing or invalid");
}

// 5. create UDP socket and send message
const socket = dgram.createSocket("udp4");
const myMsg = Buffer.from("hello?", "utf8");

socket.send(myMsg, 0, myMsg.length, port, host, (err) => {
  if (err) console.error("Send failed:", err);
  else console.log(`Message sent to ${host}:${port}`);
});

socket.on("message", (msg) => {
  console.log("Received message:", msg);
});