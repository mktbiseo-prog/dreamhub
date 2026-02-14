// ---------------------------------------------------------------------------
// Auth Routes — HTTP route mapping for Dream ID endpoints
//
// Maps HTTP paths to AuthHandlers methods. Used by the gateway server
// to serve REST auth endpoints alongside the GraphQL federation.
//
// Routes:
//   POST /api/auth/register         — Email/password registration
//   POST /api/auth/login            — Email/password login
//   POST /api/auth/social/google    — Google OAuth login
//   POST /api/auth/social/apple     — Apple login
//   POST /api/auth/social/kakao     — Kakao login
//   POST /api/auth/refresh          — Token rotation
//   POST /api/auth/logout           — Session termination
//   GET  /api/auth/me               — Current user info
// ---------------------------------------------------------------------------

import { AuthHandlers } from "@dreamhub/auth/handlers";
import { UserStore } from "@dreamhub/auth/user-store";
import type { HandlerResponse } from "@dreamhub/auth/handlers";
import type { SocialProvider } from "@dreamhub/shared-types";
import type { IncomingMessage, ServerResponse } from "http";

/**
 * Auth router that handles all /api/auth/* requests.
 * Can be used standalone or integrated with an existing HTTP server.
 */
export class AuthRouter {
  readonly handlers: AuthHandlers;
  readonly store: UserStore;

  constructor(store?: UserStore) {
    this.store = store ?? new UserStore();
    this.handlers = new AuthHandlers(this.store);
  }

  /**
   * Route an HTTP request to the appropriate handler.
   * Returns null if the path doesn't match any auth route.
   */
  async route(
    method: string,
    path: string,
    body: unknown,
    headers: Record<string, string | undefined>,
  ): Promise<HandlerResponse | null> {
    // Normalize path
    const normalized = path.replace(/\/+$/, "");

    if (method === "POST") {
      switch (normalized) {
        case "/api/auth/register":
          return this.handlers.register(body);
        case "/api/auth/login":
          return this.handlers.login(body);
        case "/api/auth/social/google":
          return this.handlers.socialLogin("google", body);
        case "/api/auth/social/apple":
          return this.handlers.socialLogin("apple", body);
        case "/api/auth/social/kakao":
          return this.handlers.socialLogin("kakao", body);
        case "/api/auth/refresh":
          return this.handlers.refresh(body);
        case "/api/auth/logout":
          return this.handlers.logout();
      }
    }

    if (method === "GET" && normalized === "/api/auth/me") {
      return this.handlers.me(headers.authorization);
    }

    return null; // Not an auth route
  }

  /**
   * Handle a Node.js HTTP request/response pair.
   * Returns true if the request was handled, false if not an auth route.
   */
  async handleHttp(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const method = req.method ?? "GET";
    const url = req.url ?? "/";

    if (!url.startsWith("/api/auth")) return false;

    // Parse body for POST requests
    let body: unknown = {};
    if (method === "POST") {
      body = await parseJsonBody(req);
    }

    const headers: Record<string, string | undefined> = {
      authorization: req.headers.authorization,
    };

    const result = await this.route(method, url, body, headers);

    if (!result) return false;

    res.writeHead(result.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body));
    return true;
  }
}

/**
 * Parse JSON body from an IncomingMessage stream.
 */
function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

export { AuthHandlers, UserStore };
