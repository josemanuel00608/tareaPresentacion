import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

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

    if (!email || !password || !full_name) {
      return new Response(
        JSON.stringify({ error: "Faltan datos requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables de entorno no configuradas");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Registrar usuario
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    if (!signUpData.user) {
      throw new Error("No se pudo crear el usuario");
    }

    const userId = signUpData.user.id;

    // Crear perfil
    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({ id: userId, email, full_name });

      if (profileError && profileError.code !== "PGRST116") {
        console.warn("Error en perfil:", profileError);
      }
    } catch (e) {
      console.warn("Excepción en perfil:", e);
    }

    // Asignar rol
    try {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "student" });

      if (roleError && roleError.code !== "PGRST116") {
        console.warn("Error en rol:", roleError);
      }
    } catch (e) {
      console.warn("Excepción en rol:", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: signUpData.user,
        message: "Usuario registrado exitosamente",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
