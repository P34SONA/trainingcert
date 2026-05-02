import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

let supabaseAdminClient: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error("Missing SUPABASE environment variables (VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).");
    }
    
    supabaseAdminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * ADMIN: Create a new user
 */
app.post("/api/admin/create-user", async (req, res) => {
  const { email, password, fullName, role } = req.body;

  try {
    const admin = getSupabaseAdmin();
    // 1. Create auth user
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role }
    });

    if (authError) throw authError;

    // 2. Insert into profiles table
    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        email: email,
        full_name: fullName,
        role: role
      });

    if (profileError) throw profileError;

    res.json({ success: true, user: authUser.user });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Vite integration
 */
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
