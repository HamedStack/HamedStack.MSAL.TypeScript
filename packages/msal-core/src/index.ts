export class AzureAuthenticationClient {
    public static async acquireTokenByUsernamePassword(credential: UsernamePasswordCredential): Promise<AzureAuthenticationToken> {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/x-www-form-urlencoded");
        headers.append("cache-control", "no-cache");

        const urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "password");
        urlencoded.append("username", credential.username);
        urlencoded.append("password", credential.password);
        urlencoded.append("client_id", credential.clientId);
        urlencoded.append("client_secret", credential.clientSecret);
        urlencoded.append("scope", credential.scopes.map(s => s.trim()).join(" "));

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: urlencoded,
        };

        const response = await fetch(`https://login.microsoftonline.com/${credential.tenantId}/oauth2/v2.0/token`, requestOptions);
        const json = await response.json();
        return json as AzureAuthenticationToken;
    }

    public static async acquireTokenByRefreshToken(credential: RefreshTokenCredential): Promise<AzureAuthenticationToken> {

        const response = await fetch(`https://login.microsoftonline.com/${credential.tenantId}/oauth2/v2.0/token`, {
            method: "POST",
            headers: {
                "cache-control": "no-cache",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: credential.clientId,
                refresh_token: credential.refreshToken,
                scope: credential.scopes.map(s => s.trim()).join(" "),
                client_secret: credential.clientSecret,
                client_info: "1",
            }),
        });
        return await response.json() as AzureAuthenticationToken;
    }
}

export interface AzureAuthenticationToken {
    token_type: string;
    scope: string;
    expires_in: number;
    ext_expires_in: number;
    access_token: string;
    refresh_token: string;
    id_token: string;
}

export interface UsernamePasswordCredential {
    username: string;
    password: string;
    tenantId: string,
    clientId: string,
    clientSecret: string,
    scopes: string[],
}

export interface RefreshTokenCredential {
    tenantId: string,
    clientId: string,
    clientSecret: string,
    scopes: string[],
    refreshToken: string,
}