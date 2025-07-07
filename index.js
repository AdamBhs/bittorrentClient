import fs from "fs";
import bencode from "bencode";
import {getPeers} from "./tracker";

import dgram from "dgram"; // the module for UDP (user datagram protocol)
import {Buffer} from "buffer";
import { parse as urlParse } from "url"; 

const torrent = bencode.decode(fs.readFileSync("puppy.torrent"));

getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
})