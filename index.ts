import { PrismaClient } from '@prisma/client';
import { defaultLogger } from './logger';
import axios, { isCancel, AxiosError } from 'axios';
import { getUsernameAndPasswordPair } from './utils';
const prisma = new PrismaClient();

const IPFS_SERVER = process.env.IPFS_SERVER || "";

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
const uploadFile = async (fileBuffer: Buffer): Promise<string> => {
    const logger = defaultLogger("upload_api");
    logger.info("Uploading file to IPFS...");
    const response = await axios.post(
        IPFS_SERVER,
        fileBuffer,
        {
            headers: {
                'Content-Type': 'application/octet-stream',
                Authorization: `Basic ${Buffer.from(
                    `${await getUsernameAndPasswordPair()}`
                ).toString('base64')}`
            }
        }
    );

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
  return await uploadFile(buffer);
}

