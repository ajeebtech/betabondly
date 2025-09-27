import NextAuth, { NextAuthOptions } from 'next-auth';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { adminAuth, adminDb, isAdminInitialized } from './firebase/admin';
import { DefaultSession } from 'next-auth';
import { Adapter } from 'next-auth/adapters';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

// Create a conditional adapter based on whether admin is initialized
const adapter = isAdminInitialized() && adminDb 
  ? FirestoreAdapter(adminDb) as Adapter
  : undefined;

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    // Add your authentication providers here
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Disable database session if adapter is not available
  session: {
    strategy: adapter ? 'database' : 'jwt'
  },
  debug: process.env.NODE_ENV === 'development'
};

export default NextAuth(authOptions);
