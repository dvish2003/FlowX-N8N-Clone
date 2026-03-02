import { withErrorHandler } from "@/lib/mongodb/withErrorHandler";
import { UserService } from "@/services/user/UserService";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
       authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:[
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/drive.metadata.readonly",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/spreadsheets",
            
          ].join(" "),
        },
      },
      httpOptions: { timeout: 10000 },
    
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const userService = UserService.getInstance();
        const user = await userService.findUserByEmail(credentials.email);

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in");
        }

        if (!user.password) {
          throw new Error("This account uses Google login. Please sign in with Google.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks:{
    async signIn({user,account}:Record<string, any>){
        const userData = {...user} as {id:string, name:string, email:string, image:string}
          const access_token = account?.access_token;
          const refresh_token = account?.refresh_token;
        

          console.log("🔐 Account:", account);
          
          withErrorHandler(async () => {
            const userService = UserService.getInstance();
            await userService.createUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              image: userData.image,
              access_token,
              refresh_token,
            });
          })(

          )
        return true;
  },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async redirect({url, baseUrl }:Record<string, any>){
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    if (new URL(url).origin === baseUrl) return `${baseUrl}/projects`;
    return baseUrl;
  },
  async session({session, token}:Record<string, any>){
    if(token?.userId){
      session.user.id = token.userId;
    }
   return session;
  },
  async jwt({token, user}:Record<string, any>){
    if(user){
      try {
          const userService = UserService.getInstance();
          const dbUser = await userService.findUserByEmail(user.email);
          if(dbUser){
            token.userId = dbUser.id;
          }
      } catch (error) {
        console.error("Error fetching user in JWT callback:", error instanceof Error ? error.message : String(error));
        
      }
    }
    return token;
  }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };