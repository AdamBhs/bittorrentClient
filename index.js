import fs from "fs";
import bencode from "bencode";
import {getPeers} from "./tracker";

import dgram from "dgram"; // the module for UDP (user datagram protocol)
import {Buffer} from "buffer";
import { parse as urlParse } from "url"; 
import {open} from "./torrent-parser";


const torrent = open('puppy.torrent');

getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
})