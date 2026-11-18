import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { handleAPI } from "../server/api.mjs";
import { handleCambridgeMedia } from "../server/cambridge-media.mjs";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/guest/cambridge/media/")) {
      return handleCambridgeMedia(request, env);
    }
    if (url.pathname.startsWith("/api/")) {
      return handleAPI(request, env, { origin: (env as any).PUBLIC_ORIGIN || url.origin });
    }
    if (/^\/media\/listening\/[A-Za-z0-9_-]+\.mp3$/.test(url.pathname)) {
      return Response.redirect("https://sls-reading-zac.b-cdn.net" + url.pathname, 302);
    }
    if (url.pathname === "/") {
      return Response.redirect(new URL("/index.html", request.url).toString(), 302);
    }
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};

export default worker;
