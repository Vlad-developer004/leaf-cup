import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { i18nRouter } from 'next-i18n-router';
import { i18nConfig } from './i18nConfig';

const { auth } = NextAuth(authConfig);

const authPages = ["/sign-in", "/register"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  
  // Check if pathname matches auth pages (ignoring locale prefix like /en/ or /de/)
  const isAuthPage = authPages.some(page => pathname === page || pathname.endsWith(page));
  const isAdminRoute = pathname.includes("/admin");

  // Server Action, вызванный со страницы /sign-in или /register (например,
  // синхронизация корзины сразу после входа), шлёт POST на тот же URL — это
  // не переход пользователя на страницу, редиректить его здесь не нужно.
  const isServerAction = req.headers.has("next-action");

  if (isAuthPage && isLoggedIn && !isServerAction) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/sign-in", req.nextUrl));
    }
    if (req.auth?.user.role !== "ADMIN") {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }

  return i18nRouter(req, i18nConfig);
});

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
};
