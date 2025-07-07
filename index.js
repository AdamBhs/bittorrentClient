import fs from "fs";
import bencode from "bencode";
// import {getPeers} from "./tracker.js";

import dgram from "dgram"; // the module for UDP (user datagram protocol)
import {Buffer} from "buffer";
import { parse as urlParse } from "url"; 
import { open } from './torrent-parser.js'; 


const torrent = open('puppy.torrent');

console.log(torrent);
// getPeers(torrent, peers => {
//     console.log('list of peers: ', peers);
// })