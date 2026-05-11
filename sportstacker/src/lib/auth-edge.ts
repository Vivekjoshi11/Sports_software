import NextAuth from "next-auth"

export const { auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith('/tournaments') ||
        nextUrl.pathname.startsWith('/admin')
      if (isOnProtectedRoute && !isLoggedIn) {
        return false
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
})
