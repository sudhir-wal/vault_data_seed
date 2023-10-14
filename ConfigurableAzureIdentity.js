const { ClientSecretCredential, AuthenticationError, CredentialUnavailableError } = require('@azure/identity')

class ConfigurableAzureIdentity {
    constructor(options) {
        this._credential = undefined;
        const tenantId = options.tenantId, clientId = options.clientId, clientSecret = options.clientSecret;
        
        if (tenantId) {
            this.checkTenantId(tenantId);
        }
        
        if (tenantId && clientId && clientSecret) {
            this._credential = new ClientSecretCredential(tenantId, clientId, clientSecret, options);
            return;
        }
    }

    checkTenantId(tenantId) {
        if (!tenantId.match(/^[0-9a-zA-Z-.:/]+$/)) {
            const error = new Error("Invalid tenant id provided. You can locate your tenant id by following the instructions listed here: https://docs.microsoft.com/partner-center/find-ids-and-domain-names.");
            throw error;
        }
    }

    /**
     * Authenticates with Azure Active Directory and returns an access token if successful.
     *
     * @param scopes - The list of scopes for which the token will have access.
     * @param options - Optional parameters. See {@link GetTokenOptions}.
     */
    async getToken(scopes, options = {}) {
        if (this._credential) {
            try {
                const result = await this._credential.getToken(scopes, options);
                
                return result;
            } catch (err) {
                const authenticationError = new AuthenticationError(400, {
                    error: `ConfigurableAzureIdentity authentication failed. To troubleshoot, visit https://aka.ms/azsdk/js/identity/AzureVaultAuth/troubleshoot.`,
                    error_description: err.message.toString().split("More details:").join(""),
                });

                throw authenticationError;
            }
        }
        
        throw new CredentialUnavailableError(`ConfigurableAzureIdentity is unavailable. No underlying credential could be used. To troubleshoot, visit https://aka.ms/azsdk/js/identity/AzureVaultAuth/troubleshoot.`);
    }
}

module.exports = ConfigurableAzureIdentity;