import { SilentRequest, LoadTokenOptions, Configuration, PublicClientApplication } from "@azure/msal-browser";
import { ServerAuthorizationTokenResponse, ExternalTokenResponse, AuthenticationScheme } from "@azure/msal-common";
import { AzureAuthenticationToken } from "@hamedstack/msal-core";

export class AzureAuthenticationBrowserClient {

    public static setTokenCache(token: AzureAuthenticationToken, credential: SilentRequestCredential): void {

        const isBrowserEnvironment = typeof window !== "undefined";
        if (!isBrowserEnvironment) {
            throw new Error("This function is only available in browser environment.");
        }
        const tokenResponse: ServerAuthorizationTokenResponse =
            token as ServerAuthorizationTokenResponse;
        const accessToken: string | undefined = tokenResponse.access_token;
        const idToken: string | undefined = tokenResponse.id_token;
        const scope: string = tokenResponse.scope || "";
        const refreshToken: string | undefined = tokenResponse.refresh_token;
        const expiresIn: number | undefined = Number(tokenResponse.expires_in);

        if (accessToken && idToken && refreshToken) {
            const silentRequest: SilentRequest = {
                scopes: scope.split(" "),
                authority: `https://login.microsoftonline.com/${credential.tenantId}/oauth2/v2.0/token`,
                account: {
                    homeAccountId: `${credential.homeOrLocalAccountId}.${credential.tenantId}`,
                    environment: credential.environment,
                    tenantId: credential.tenantId,
                    username: credential.username,
                    localAccountId: credential.homeOrLocalAccountId,
                },
            };

            const serverResponse: ExternalTokenResponse = {
                token_type: AuthenticationScheme.BEARER,
                scope: scope,
                expires_in: expiresIn,
                id_token: idToken,
                access_token: accessToken,
                refresh_token: refreshToken,
            };

            const loadTokenOptions: LoadTokenOptions = {
                extendedExpiresOn: Number(tokenResponse.ext_expires_in),
            };

            const msalConfig: Configuration = {
                auth: {
                    clientId: credential.clientId,
                    authority: "https://login.microsoftonline.com/" + credential.tenantId,
                },
                cache: {
                    cacheLocation: "sessionStorage",
                    storeAuthStateInCookie: false,
                    secureCookies: false,
                },
            };

            const msalObj = new PublicClientApplication(msalConfig);
            const tokenCache = msalObj.getTokenCache();
            tokenCache.loadExternalTokens(
                silentRequest,
                serverResponse,
                loadTokenOptions
            );
        }
    }


    public static setSessionStorage(token: AzureAuthenticationToken, credential: SessionStorageCredential, manualSessionSet?: (accessTokenKey: string, credential: SessionStorageCredential) => [{ key: string, value: string }]): void {
        const isBrowserEnvironment = typeof window !== "undefined";
        if (!isBrowserEnvironment) {
            throw new Error("This function is only available in browser environment.");
        }
        const tokenResponse: ServerAuthorizationTokenResponse =
            token as ServerAuthorizationTokenResponse;
        if (
            tokenResponse.access_token &&
            tokenResponse.scope &&
            tokenResponse.access_token !== "" &&
            tokenResponse.scope !== ""
        ) {
            const now = Math.floor(Date.now() / 1000);
            const accessTokenKey =
                `${credential.homeOrLocalAccountId}.${credential.realm}-${credential.environment}-accesstoken-${credential.clientId}-${credential.realm}-${credential.target}`;
            const accessTokenValue = {
                cachedAt: now.toString(),
                clientId: credential.clientId,
                credentialType: "AccessToken",
                environment: credential.environment,
                expiresOn: (now + credential.expOn).toString(),
                extendedExpiresOn: (now + credential.extExpOn).toString(),
                homeAccountId: `${credential.homeOrLocalAccountId}.${credential.realm}`,
                realm: credential.realm,
                secret: tokenResponse.access_token,
                target: credential.target,
                tokenType: AuthenticationScheme.BEARER,
            };
            sessionStorage.setItem(accessTokenKey, JSON.stringify(accessTokenValue));

            manualSessionSet?.(accessTokenKey, credential).forEach((item) => {
                sessionStorage.setItem(item.key, item.value);
            });
    
            setMsalTokenKeys(accessTokenKey, credential);

        }

        function setMsalTokenKeys(accessTokenKey: string, credential: SessionStorageCredential): void {
            const obj = JSON.parse(sessionStorage.getItem("msal.token.keys." + credential.clientId) as string);
            if (!obj.accessToken.includes(accessTokenKey))
                obj.accessToken.push(accessTokenKey);
            sessionStorage.setItem("msal.token.keys." + credential.clientId, JSON.stringify(obj));
        }
    }

}


export interface SilentRequestCredential {
    username: string;
    tenantId: string;
    clientId: string;
    homeOrLocalAccountId: string,
    environment: string
}

export interface SessionStorageCredential {
    homeOrLocalAccountId: string,
    realm: string,
    environment: string,
    clientId: string,
    target: string,
    accessToken: string,
    expOn: number,
    extExpOn: number
}