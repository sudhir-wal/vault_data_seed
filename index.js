const { SecretClient } = require("@azure/keyvault-secrets");
const ConfigurableAzureIdentity = require('./ConfigurableAzureIdentity');
// const { DefaultAzureCredential } = require("@azure/identity");
const fs = require('fs');
const secrets = require('./secrets.json');
const { randomBytes } = require('node:crypto')
const jwt = require('jsonwebtoken');

require('dotenv').config();

async function main() {
  const credential = new ConfigurableAzureIdentity({
    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET
  });

  const keyVaultName = process.env["KEY_VAULT_NAME"];
  if(!keyVaultName) throw new Error("KEY_VAULT_NAME is empty");
  const url = "https://" + keyVaultName + ".vault.azure.net";

  const client = new SecretClient(url, credential);

  // Create a secrets
  for (const key in secrets) {
    if (secrets.hasOwnProperty(key)) {
        const val = secrets[key];
        
        const result = await client.setSecret(key, val);
        console.log("result: ", result);
    }
  }

  const keyContent = fs.readFileSync('./docusign-sandbox.key', 'utf8');
  const keyResult = await client.setSecret('docusignKey', keyContent);
  console.log(keyResult);

  const jwtSecret = randomBytes(64).toString("hex")
  const jwtSecretResult = await client.setSecret('jwtTokenSecret', jwtSecret);
  console.log(jwtSecretResult);

  const faaGeneratedToken = jwt.sign({
      id: '98765', // LDAP ID
      role: 1,
      extSys: 'FAA'
  }, jwtSecret);
  const faaTokenSecretResult = await client.setSecret('faaApiAuthToken', faaGeneratedToken);
  console.log(faaTokenSecretResult);

  const rdmsGeneratedToken = jwt.sign({
      id: 'westagilelabs', // LDAP ID
      role: 1,
      extSys: 'RDMS'
  }, jwtSecret);
  const rdmsTokenSecretResult = await client.setSecret('webCemApiToken', rdmsGeneratedToken);
  console.log(rdmsTokenSecretResult);
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
