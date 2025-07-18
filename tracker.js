import fs from "fs";
import bencode from "bencode";

import dgram from "dgram"; // the module for UDP (user datagram protocol)
import {Buffer} from "buffer";
import { parse as urlParse } from "url"; 
import crypto from "crypto";
import {infoHash, size} from './torrent-parser.js'
import {genId} from "./util.js";

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
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
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
  buf.writeUInt32BE(0, 8);
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
  const buf = Buffer.allocUnsafe(98);

  // connection id
  connId.copy(buf, 0);
  // action
  buf.writeUInt32BE(1, 8);
  // transaction id
  crypto.randomBytes(4).copy(buf, 12);
  // info hash
  torrentParser.infoHash(torrent).copy(buf, 16);
  // peerId
  genId().copy(buf, 36);
  // downloaded
  Buffer.alloc(8).copy(buf, 56);
  // left
  torrentParser.size(torrent).copy(buf, 64);
  // uploaded
  Buffer.alloc(8).copy(buf, 72);
  // event
  buf.writeUInt32BE(0, 80);
  // key 
  crypto.randomBytes(4).copy(buf, 88);
  // num want
  buf.writeInt32BE(-1, 92);
  // port
  buf.writeUInt16BE(port, 96)

  return buf;
}

function parseAnnounceResp(resp) {

  function group(iterable, groupSize) {
    let groups = [];
    for(let i = 0; i < iterable.length; i+= groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    } 
    return groups
  }

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    interval: resp.readUInt32BE(8),    
    leechers: resp.readUInt32BE(12),   
    seeders: resp.readUInt32BE(16),      
    peers: group(resp.slice(20), 6).map(address => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      }
    })
  }
}