declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    PUBLIC_ORIGIN?: string;
    SLS_SECONDARY_ORIGIN?: string;
    SLS_BOOTSTRAP_TOKEN?: string;
    SLS_ADMIN_RECOVERY?: string;
  }
}
