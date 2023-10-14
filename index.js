const { SecretClient } = require("@azure/keyvault-secrets");
const ConfigurableAzureIdentity = require('./ConfigurableAzureIdentity');
// const { DefaultAzureCredential } = require("@azure/identity");
const fs = require('fs');
const secrets = require('./secrets.json');
const { randomBytes } = require('node:crypto')

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
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});
