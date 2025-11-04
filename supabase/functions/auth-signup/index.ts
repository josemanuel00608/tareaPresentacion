import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, password, full_name }: SignUpRequest = await req.json();

    // Validar datos
    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: "Faltan datos requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Usar la URL de Supabase desde las variables de entorno
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Faltan variables de entorno de Supabase");
    }

    // Crear usuario con auth admin API
    const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      }),
    });

    const signUpData = await signUpResponse.json();

    if (!signUpResponse.ok) {
      return new Response(
        JSON.stringify({ error: signUpData.message || "Error al crear usuario" }),
        {
          status: signUpResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = signUpData.id;

    // Crear perfil de usuario usando Supabase client
    try {
      await fetch(`${supabaseUrl}/rest/v1/user_profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          id: userId,
          email,
          full_name,
        }),
      });
    } catch (e) {
      console.log("Profile creation note:", e.message);
    }

    // Asignar rol de estudiante
    try {
      await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          role: "student",
        }),
      });
    } catch (e) {
      console.log("Role assignment note:", e.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: signUpData,
        message: "Usuario registrado exitosamente",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
