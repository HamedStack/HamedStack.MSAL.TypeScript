import { type Page } from "@playwright/test";
import { CacheKVStore } from "@azure/msal-node";

export class AzureAuthenticationPlaywrightClient {

    public static async setSessionStorage(page: Page, tokens: CacheKVStore, autoPageReload = true) {
        const cacheKeys = Object.keys(tokens);
        for (const key of cacheKeys) {
            const value = JSON.stringify(tokens[key]);
            await page.context().addInitScript(
                (arr: string[]) => {
                    window.sessionStorage.setItem(arr[0], arr[1]);
                },
                [key, value]
            );
        }
        if (autoPageReload)
            await page.reload();
    }
}