import { PrismaClient } from '@prisma/client';
import { defaultLogger } from './logger';
import axios, { isCancel, AxiosError } from 'axios';
import { formatBytes, getUsernameAndPasswordPair } from './utils';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IPFS_SERVER = process.env.IPFS_SERVER || '';

/**
 * Generates a random UUID (Universally Unique Identifier) string.
 *
 * @return {string} The generated UUID string.
 */
function getUUID(): string {
    return 'xxxxxxxxx'.replace(/[x, y]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

async function writeAPIData(name: string, cids: any, API_KEY: string) {
    // console.log(name, cids);
    const logger = defaultLogger('storage');
    logger.info('Writing new data to database file_name: ' + name);
    const user = await prisma.storage.create({
        data: {
            file_name: name,
            file_cids: cids,
            API_KEY: API_KEY
        }
    });
}

/**
 * Uploads a file to the specified IPFS server using the given file buffer.
 *
 * @param {Buffer} fileBuffer - The buffer containing the file data to be uploaded.
 * @return {Promise<string>} A promise that resolves to the data returned by the server.
 */
const uploadChunkFromBuffer = async (fileBuffer: Buffer): Promise<string> => {
    const logger = defaultLogger('upload_api');
    logger.info('Uploading file to IPFS...');
    const response = await axios.post(IPFS_SERVER, fileBuffer, {
        headers: {
            'Content-Type': 'application/octet-stream',
            Authorization: `Basic ${Buffer.from(
                `${await getUsernameAndPasswordPair()}`
            ).toString('base64')}`
        }
    });

    return response.data;
};

/**
 * Uploads a chunk of data to the server.
 *
 * @param {ArrayBuffer} chunk - The chunk of data to be uploaded.
 * @param {string} filename - The name of the file.
 * @return {Promise<Object>} A promise that resolves to the uploaded data as an object.
 */
async function uploadChunk(chunkBuffer: ArrayBuffer) {
    const buffer = Buffer.from(chunkBuffer);
    return await uploadChunkFromBuffer(buffer);
}

export async function uploadFile(apiKey: string, filePath: string) {
    const logger = defaultLogger('upload_file');
    logger.info("Create read stream");
    const fileStream = fs.createReadStream(filePath);
    const CHUNK_SIZE = 80 * 1024 * 1024;
    const filename = path.basename(filePath);
    let chunkSize = 0;
    let packedChunk: Buffer[] = [];
    let cids: Promise<any>[] = [];
    
    fileStream.on('data', (chunk: Buffer) => {
        packedChunk.push(chunk);
        chunkSize += chunk.byteLength;


        if (chunkSize > CHUNK_SIZE) {
            logger.info(`Processing chunk: ${formatBytes(chunkSize)}`);
            let offset = 0;
            const combinedArrayBuffer = new ArrayBuffer(chunkSize);

            for (const pack_chunk of packedChunk) {
                const chunkView = new Uint8Array(
                    combinedArrayBuffer,
                    offset,
                    pack_chunk.byteLength
                );
                chunkView.set(pack_chunk);
                offset += pack_chunk.byteLength;
            }

            logger.info('Uploading chunk...');
            const cid_promises = uploadChunk(
                Buffer.from(combinedArrayBuffer),
            );
            cids.push(cid_promises);
            logger.info('Upload chunk finished');
            packedChunk = [];
            chunkSize = 0;
        }
    });

    fileStream.on('end', async () => {
        logger.info("Processing end of stream");
        if (chunkSize != 0 && packedChunk.length > 0) {
            logger.info(`Last chunk: ${formatBytes(chunkSize)}`);
            logger.info(`Processing chunk: ${formatBytes(chunkSize)}`);
            let offset = 0;
            const combinedArrayBuffer = new ArrayBuffer(chunkSize);

            for (const pack_chunk of packedChunk) {
                const chunkView = new Uint8Array(
                    combinedArrayBuffer,
                    offset,
                    pack_chunk.byteLength
                );
                chunkView.set(pack_chunk);
                offset += pack_chunk.byteLength;
            }

            logger.info('Uploading upload...');
            const cid_promises = uploadChunk(
                Buffer.from(combinedArrayBuffer),
            );
            cids.push(cid_promises);
            logger.info('Upload part finished');
            packedChunk = [];
            chunkSize = 0;
        }

        let processed_cids: string[] = [];
        let counter = 0;
        for (const cid of cids) {
            logger.info('Awaiting for all upload to finished');
            processed_cids.push((await cid).cid);
            counter++;
            logger.info(`Awaited complete: ${counter}/${cids.length}`);
        }

        await writeAPIData(filename, processed_cids, apiKey);

        return processed_cids;
    });

    fileStream.on('error', (error) => {
        logger.error('Error reading file:', error);
        throw error;
    });
}
