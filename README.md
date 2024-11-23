# implimentation of Auth js

#### [vedio Link](https://www.youtube.com/watch?v=sijpPYDWBg4&list=PLu71SKxNbfoBAaWGtn9GA2PTw0HO0tXzq)

## 1st

create two File
src > app > api > auth > [...nextauth] > options.ts && routes.ts

[documentation](https://next-auth.js.org/getting-started/example)

## 2nd

src > app > api > auth > [...nextauth] > options.ts
[documentation](https://next-auth.js.org/providers/credentials)

```bash
# 1st
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [{ email: credentials.identifier }, { username: credentials.identifier }] //username and email power jonno credentials.identifier.email / credentials.identifier
                    })

                    if (!user) {
                        throw new Error("No user found whit this email")
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login")
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password) ///credentials.identifier use na kore direct powajay

                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("InCorrect Password")
                    }
                } catch (err: any) {
                    throw new Error(err)
                }
            }
        })
    ],


    <!-- 2nd start  -->
    create file
    src > types > next-auth.d.ts
    <!-- 2nd end-->


    <!--3rd -->
    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
    },

    <!--3rd end-->

    pages: {
        signIn: '/sign-in'
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}

```

## src > types > next-auth.d.ts

```bash

import 'next-auth'
import { DefaultSession } from 'next-auth';


declare module "next-auth" {
    interface User {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        username?: string;
    }
    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            isAcceptingMessages?: boolean;
            username?: string;
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        username?: string;
    }
}


```

###### next =>

## src > app > api > auth > [...nextauth] > routes.ts

```bash

import NextAuth from "next-auth";
import { authOptions } from "./option";

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

```

###### next =>

### middleware

## src > middleware.ts

```bash


import { NextRequest, NextResponse } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    //2nd start

    const token = await getToken({ req: request })
    const url = request.nextUrl

    if (token && (
        url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify") ||
        url.pathname.startsWith("/")

    )) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    return NextResponse.next()

    //2nd end
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/sign-in',
        'sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
}


```

### testing

### src > app > (auth) > sign-in > page.tsx

```bash
'use client'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button className="bg-orange-500 px-4 py-1 m-4 rounded" onClick={() => signIn()}>Sign in</button>
    </>
  )
}

```

## context

### src > context > AuthProvider.tsx

```bash

"use client";

import { SessionProvider } from "next-auth/react";
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}

```

## wrap provider

```bash

<AuthProvider>
    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
    </body>
</AuthProvider>

```

run project and go to [http://localhost:3001/sign-in] and see result autometic a button created



# impliment virsel ai sdk

```
npm install ai openai
```

### .env
```
OPEN_API_KEY=XXXXXXXXXXXX
```
### src > app > api > suggest-message > route.ts

```bash
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 400,
      messages: [{ role: 'system', content: prompt }],
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0].delta.content ?? ''; // Handle null/undefined
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  }
}
```