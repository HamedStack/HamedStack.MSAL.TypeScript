import { PublicClientApplication, CacheKVStore, UsernamePasswordRequest } from "@azure/msal-node";
import { UsernamePasswordCredential } from "@hamedstack/msal-core";

export class AzureAuthenticationNodeClient {

    public static async getTokenCache(credential: UsernamePasswordCredential): Promise<CacheKVStore> {
        const config = {
            auth: {
                clientId: credential.clientId,
                authority:
                    "https://login.microsoftonline.com/" + credential.tenantId,
            },
        };
        const pca = new PublicClientApplication(config);
        const usernamePasswordRequest: UsernamePasswordRequest = {
            scopes: credential.scopes,
            username: credential.username,
            password: credential.password,
        };
        await pca.acquireTokenByUsernamePassword(usernamePasswordRequest);
        return pca.getTokenCache().getKVStore();
    }
}