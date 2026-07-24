import { HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import * as jwt from 'jsonwebtoken';
import { NBException } from '../exceptions/forbidden-error.exception';

dotenv.config();

const jwtSecretKey = process.env.JWT_SECRET_KEY || '';
const jwtRefreshTokenKey = process.env.JWT_REFRESH_SECRET || '';
const jwtAccessTokenKey = process.env.JWT_ACCESS_SECRET || '';
const secretKey = process.env.ID_ENCRYPTION_SECRET_KEY || '';
const secretIv = process.env.ID_ENCRYPTION_IV || '';
const CRYPT_JS_KEY = process.env.CRYPT_JS_KEY || '';
const encryptMethod = 'aes-256-gcm';

// Precompute Key & IV once to improve performance
const iv = crypto.createHash('sha256').update(secretIv, 'utf8').digest().subarray(0, 12);
const key = crypto.pbkdf2Sync(secretKey, 'salt', 10000, 32, 'sha256'); // Reduced iterations
@Injectable()
export class AppHelper {

    VIEncodeString(input: any): string {
        if (input) {
            input = input + '**NexBank2026';
            return this.strRot13(this.base64Encode(input));
        }
        return '';
    }

    VIDecodeString(string: any = null): string {
        if (string) {
            const key = 'NexBank2026';
            const data = this.base64Decode(this.strRot13(string));
            const dataArr = data.split("**");
            const decodedString = (key == dataArr[1]) ? dataArr[0] : '';
            return decodedString;
        } else {
            return '';
        }
    }

    private strRot13(str: string): string {
        return (str + '').replace(/[a-z]/gi, (s) =>
            String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13)),
        );
    }

    private base64Encode(str: string): string {
        const buff = Buffer.from(str);
        return buff.toString('base64');
    }

    private base64Decode(str: string): string {
        return Buffer.from(str, 'base64').toString()
    }

    public encryptString(data: any): string {
        if (data !== undefined && data !== null) {
            const stringData = typeof data === 'string' ? data : JSON.stringify(data); // Convert to string if not already
            const encrypted = this.__stringDecryption('encrypt', stringData);
            return encrypted;
        }
        return '';
    }

    public decryptString(data: string): any {
        if (data) {
            const decrypted = this.__stringDecryption('decrypt', data);
            try {
                return JSON.parse(decrypted); // Try to parse JSON
            } catch {
                return decrypted; // Return as string if not JSON
            }
        }
        return '';
    }

    private __stringDecryption(action: string, text: string): string {

        const encryptMethod = 'aes-256-gcm'; // Encryption method
        const secretKey = process.env.CRYPTO_SECRETKEY || ''; // Secret Key
        const secretIv = process.env.CRYPTO_SECRETVI || ''; // Initialization Vector

        // Generate key and IV with appropriate lengths
        const key = crypto.createHash('sha256').update(secretKey, 'utf8').digest().slice(0, 32);
        const iv = crypto.createHash('sha256').update(secretIv, 'utf8').digest().slice(0, 12); // 12 bytes for GCM mode

        if (action === 'encrypt') {
            const cipher = crypto.createCipheriv(encryptMethod, key, iv);

            let encrypted = cipher.update(text, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            // Get the authentication tag and attach it to the encrypted output
            const authTag = cipher.getAuthTag();
            return `${encrypted}:${authTag.toString('base64')}`; // Concatenate encrypted text and auth tag
        } else if (action === 'decrypt') {
            try {
                const [encryptedText, authTagBase64] = text.split(':');
                const authTag = Buffer.from(authTagBase64, 'base64');

                const decipher = crypto.createDecipheriv(encryptMethod, key, iv);
                decipher.setAuthTag(authTag); // Set the authentication tag for GCM

                let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            } catch (error: any) {
                console.error('Decryption error:', error.message);
                return '';
            }
        }
        return '';
    }

    encryptID(id: number): string {
        try {
            const cipher = crypto.createCipheriv(encryptMethod, key, iv);
            const encrypted = Buffer.concat([
                cipher.update(id.toString(), 'utf8'),
                cipher.final(),
            ]);
            return encrypted.toString('hex') + cipher.getAuthTag().toString('hex');
        } catch (error) {
            throw new NBException("invalid_string", HttpStatus.BAD_REQUEST);
        }
    }

    decryptID(encryptedText: string): number | null {

        try {
            const encrypted = Buffer.from(encryptedText.slice(0, -32), 'hex');
            const authTag = Buffer.from(encryptedText.slice(-32), 'hex');

            const decipher = crypto.createDecipheriv(encryptMethod, key, iv);
            decipher.setAuthTag(authTag);

            const decryptedBuffer = Buffer.concat([
                decipher.update(encrypted),
                decipher.final(),
            ]);

            const decryptedId = parseInt(decryptedBuffer.toString('utf8'), 10);
            if (isNaN(decryptedId)) {
                throw new NBException("invalid_encrypted_string", HttpStatus.BAD_REQUEST);
            }
            return decryptedId;
        } catch (error) {
            throw new NBException("invalid_encrypted_string", HttpStatus.BAD_REQUEST);
        }
    }

    hash(password: any) {
        const md5_1 = crypto.createHash('md5').update(password).digest('hex');
        const part1 = crypto.createHash('md5').update(md5_1 + 'dgfghfs').digest('hex');

        const md5_2 = crypto.createHash('md5').update(password).digest('hex');
        const part2Full = crypto.createHash('md5').update(md5_2 + 'fezf4z4z7').digest('hex');
        const part2 = part2Full.substring(0, 8);

        return part1 + part2;
    }

    cryptJsDecode(encryptedJsonStr: string) {
        try {

            const encryptedObj = JSON.parse(encryptedJsonStr);

            // Recreate the CipherParams object expected by CryptoJS
            const cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(encryptedObj.ct),
                iv: CryptoJS.enc.Hex.parse(encryptedObj.iv),
                salt: CryptoJS.enc.Hex.parse(encryptedObj.s),
            });

            // Decrypt
            const decrypted = CryptoJS.AES.decrypt(cipherParams, CRYPT_JS_KEY);

            // Convert to UTF-8 string
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            return plainText || '[Decryption failed: empty result]';

        } catch (error: any) {
            return `[Error decoding message]: ${error.message}`;
        }
    }

    cryptJsEncrypt(data: any) {
        try {
            const plainText = typeof data === 'string' ? data : JSON.stringify(data);

            const salt = CryptoJS.lib.WordArray.random(128 / 8); // 16-byte salt
            const iv = CryptoJS.lib.WordArray.random(128 / 8);   // 16-byte IV

            const encrypted = CryptoJS.AES.encrypt(plainText, CRYPT_JS_KEY, {
                iv: iv,
                salt: salt
            });

            const encryptedObj = {
                ct: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
                iv: iv.toString(CryptoJS.enc.Hex),
                s: salt.toString(CryptoJS.enc.Hex)
            };

            return JSON.stringify(encryptedObj);
        } catch (error: any) {
            return `[Error encrypting message]: ${error.message}`;
        }
    }

    generateUniqueId(): string {
        try {
            return `${nanoid(21)}`;
        } catch (error: any) {
            console.log('Error generating unique ID:', error);
            return `[Error generating UUID]: ${error.message}`;
        }
    }

    generateOtp(length = 6): string {
        try {
            if (length < 4 || length > 10) {
                throw new Error('OTP length must be between 4 and 10 digits.');
            }

            const min = 10 ** (length - 1);
            const max = 10 ** length;

            return crypto.randomInt(min, max).toString();
        } catch (error: any) {
            console.log('Error generating OTP:', error);
            return `[Error generating OTP]: ${error.message}`;
        }
    }

    async hashedOtp(otp: string) {
        try {
            if (otp.length < 4 || otp.length > 10) {
                throw new Error('OTP length must be between 4 and 10 digits.');
            }
            const hashedOtp = await argon2.hash(otp);
            return hashedOtp;
        } catch (error: any) {
            console.log('Error hashing OTP:', error);
            return `[Error hashing OTP]: ${error.message}`;
        }
    }

    async compareOtp(plainOtp: string, hashedOtp: string) {
        try {
            return await argon2.verify(hashedOtp, plainOtp);
        } catch (error: any) {
            console.error('Error comparing OTP:', error);
            return `[Error comparing OTP]: ${error.message}`;
        }
    }

    generateToken(mobileNumber: string, tokenType: string) {
        try {
            const payload = { mobile_number: mobileNumber, type: tokenType };

            return jwt.sign(payload, jwtSecretKey, { expiresIn: '10m' });
        } catch (error: any) {
            console.log('Error generating token:', error);
            return `[Error generating token]: ${error.message}`;
        }
    }

    generateAccessToken(payload: { sub: string; mobile_number: string; first_name?: string; last_name?: string }): string {
        try {
            return jwt.sign(
                {
                    sub: payload.sub,
                    mobile_number: payload.mobile_number,
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    type: 'access',
                },
                jwtAccessTokenKey,
                { expiresIn: '15m' }
            );
        } catch (error: any) {
            console.log('Error generating access token:', error);
            return `[Error generating access token]: ${error.message}`;
        }
    }

    generateRefreshToken(payload: { sub: string }): string {
        try {
            return jwt.sign(
                {
                    sub: payload.sub,
                    type: 'refresh',
                },
                jwtRefreshTokenKey,
                { expiresIn: '7d' }
            );
        } catch (error: any) {
            console.log('Error generating refresh token:', error);
            return `[Error generating refresh token]: ${error.message}`;
        }
    }

    verifyRefreshToken(token: string): any {
        try {
            return jwt.verify(token, jwtRefreshTokenKey);
        } catch (error: any) {
            return null;
        }
    }

    verifyToken(token: string) {
        try {
            return jwt.verify(token, jwtSecretKey);
        } catch (error: any) {
            console.log('Error verifying token:', error.message);
            return null;
        }
    }


    async hashPassword(password: string) {
        try {
            // By default, argon2 uses the Argon2id variant, which is the most secure
            return await argon2.hash(password);
        } catch (error: any) {
            console.log('Error hashing password:', error);
            return `[Error hashing password]: ${error.message}`;
        }
    }

    async comparePassword(password: string, storedHash: string) {
        try {
            return await argon2.verify(storedHash, password);
        } catch (error: any) {
            console.log('Error comparing password:', error);
            return `[Error comparing password]: ${error.message}`;
        }
    }


}