import fs from "fs";
import bencode from "bencode";
import crypto from "crypto";
import bignum from "bignum";

export function open(filepath) {
    return bencode.decode(fs.readFileSync(filepath));
};

export function size(torrent) {
    const size = torrent.info.files ? 
        torrent.info.files.map(file => file.length).reduce((a, b) => a + b) : 
        torrent.info.length;
    return bignum.toBuffer(size, {size: 8});
}

// we use the 'sha1' method for hashing becuase it's used by bittorrent there is no other hash function will work
export function infoHash(torrent) {
    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();
}