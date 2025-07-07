import fs from "fs";
import bencode from "bencode";

import dgram from "dgram"; // the module for UDP (user datagram protocol)
import {Buffer} from "buffer";
import { parse as urlParse } from "url"; 
import crypto from "crypto";

export function getPeers (torrent, callback) {
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    // 1. Send connect request
    udpSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if (respType(response) === 'connect') {
            // 2. receive and parse connect response
            const connResp = parseConnResp(response);
            // 3. send announce request
            const announceReq = buildAnnounceReq(connResp.connectionId);
            udpSend(socket, announceReq, url);
        } else if (respType(response) === 'announce') {
            // 4. parse announce response
            const announceResp = parseAnnounceResp(response);
            // 5. pass peers to callback
            callback(announceResp.peers);

        }
    })
}

function udpSend(socket, message, rawUrl, callback=() => {}) {
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.length, url.port, url.host || url.hostname, callback);
}

function respType(resp) {
  // ...
}

function buildConnReq() {
  const buf = Buffer.alloc(16);
  // connection id
  //   0x417 → This is hexadecimal for 1047
  // 0x27101980 → This is a magic number used in the protocol (date-inspired: Oct 27, 1980)
  // Together, these 8 bytes make this exact initial connection ID: 0x41727101980
  buf.writeUInt32BE(0x417, 0);
  buf.writeUInt32BE(0x27101980, 4);

  // action 
  buf.writeUInt32BE(0, 8)
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);
  return buf;
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32BE(0),
    transaction_id: resp.readUInt32BE(4),
    connection_id: resp.slice(8)
  }
}

function buildAnnounceReq(connId) {
  // ...
}

function parseAnnounceResp(resp) {
  // ...
}