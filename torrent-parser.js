import fs from "fs";
import bencode from "bencode";

export function open(filepath) {
    return bencode.decode(fs.readFileSync(filepath));
};

export function size(torrent) {

}

export function infoHash(torrent) {
    
}