/* eslint-disable @typescript-eslint/no-empty-interface */

import { AzureAuthenticationBrowserClient, SessionStorageCredential, SilentRequestCredential } from "@hamedstack/msal-browser";
import { AzureAuthenticationClient, UsernamePasswordCredential } from "@hamedstack/msal-core";

Cypress.Commands.add("authenticateWithUsernamePassword", (credential: UsernamePasswordCredentialInfo) => {
  return cy.then(() => {
    return cy.wrap(null, { log: false }).then(() => {
      return new Cypress.Promise((resolve, reject) => {
        return AzureAuthenticationClient.acquireTokenByUsernamePassword(credential as UsernamePasswordCredential).then((token) => {
          AzureAuthenticationBrowserClient.setTokenCache(token, credential as SilentRequestCredential);
          resolve(token);
        }).catch(error => { return reject(error); });
      });
    });
  });
});

Cypress.Commands.add("authenticateWithRefreshToken", (credential: RefreshTokenCredentialInfo) => {
  return cy.then(() => {
    return cy.wrap(null, { log: false }).then(() => {
      return new Cypress.Promise((resolve, reject) => {
        return AzureAuthenticationClient.acquireTokenByRefreshToken({
          clientId: credential.clientId,
          clientSecret: credential.clientSecret,
          refreshToken: credential.refreshToken,
          tenantId: credential.tenantId,
          scopes: credential.scopes,
        }).then((token) => {
          AzureAuthenticationBrowserClient.setSessionStorage(token, credential as SessionStorageCredential);
          resolve(token);
        }).catch(error => { return reject(error); });
      });
    });
  });
});

Cypress.Commands.add("clearCookiesAndStorages", (): Cypress.Chainable<Cypress.AUTWindow> => {
  return cy.window().then((window) => {
      sessionStorage.clear();
      window.sessionStorage.clear();
      cy.clearLocalStorage();
      cy.clearCookies();
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      authenticateWithUsernamePassword<AzureAuthenticationToken>(credential: UsernamePasswordCredentialInfo): Chainable<AzureAuthenticationToken>;
      authenticateWithRefreshToken<AzureAuthenticationToken>(credential: RefreshTokenCredentialInfo): Chainable<AzureAuthenticationToken>;
      clearCookiesAndStorages(): Cypress.Chainable<Cypress.AUTWindow>;
    }
  }
}

export interface UsernamePasswordCredentialInfo {
  username: string;
  password: string;
  tenantId: string,
  clientId: string,
  clientSecret: string,
  scopes: string[],
  homeOrLocalAccountId: string,
  environment: string
}

export interface RefreshTokenCredentialInfo {
  tenantId: string,
  clientId: string,
  clientSecret: string,
  scopes: string[],
  refreshToken: string,
  homeOrLocalAccountId: string,
  realm: string,
  environment: string,
  target: string,
  accessToken: string,
  expOn: number,
  extExpOn: number  
}