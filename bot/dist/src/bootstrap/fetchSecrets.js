"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("@src/bootstrap/config"));
const logger_1 = __importDefault(require("./logger"));
const fetchSecrets = () => __awaiter(void 0, void 0, void 0, function* () {
    if (config_1.default.isDev) {
        return {
            mnemonic: 'add test mnemonic',
        };
    }
    // Load the AWS SDK
    const region = 'us-east-1';
    const secretName = 'arn:aws:secretsmanager:us-east-1:725566919168:secret:prod/secret-O2a6FL';
    // Create a Secrets Manager client
    const client = new aws_sdk_1.default.SecretsManager({
        region: region,
        credentials: new aws_sdk_1.default.EC2MetadataCredentials(), // Get credentials from IAM role
    });
    try {
        let secret;
        const data = yield client.getSecretValue({ SecretId: secretName }).promise();
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
            secret = data.SecretString;
        }
        logger_1.default.log('Secrets successfully retrieved from secret manager.');
        return {
            mnemonic: secret.nmemonic,
        };
    }
    catch (err) {
        logger_1.default.error('Error while decoding secrets', err);
        throw err;
    }
});
exports.default = fetchSecrets;
//# sourceMappingURL=fetchSecrets.js.map