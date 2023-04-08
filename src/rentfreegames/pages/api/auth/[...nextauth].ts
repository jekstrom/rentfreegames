import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { getUserData, postUserData } from '../../../lib/users'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      let userData = await getUserData(profile.email);
      if (!userData) {
        // Create new user
        userData = await postUserData(profile);
      }

      return !!userData; // Signed in users should always have a data record.
    }
  }
})