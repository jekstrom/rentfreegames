import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";
import DiscordProvider from "next-auth/providers/discord";
import { getUserData, postJWTUserData } from '../../../lib/users'

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    AzureADB2CProvider({
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: "offline_access openid profile email" } }
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET
    })
  ],
   callbacks: {
    async jwt({ token, account }) {
      console.log("signin");
      // IMPORTANT: Persist the access_token to the token right after sign in
      if (account) {
        token.idToken = account.id_token;
      }

      let userData = await getUserData(token.email);
      if (!userData) {
        // Create new user
        userData = await postJWTUserData(token);
      }

      return token;
    }
   }
}

export default NextAuth(authOptions);
