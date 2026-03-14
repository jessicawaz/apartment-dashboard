import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  // Non-null claims means a user is logged in
  const [claims, setClaims] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("users")
      .select("*, groups(*)")
      .eq("user_id", userId)
      .single();

    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    // Check for existing session using getClaims
    supabase.auth
      .getClaims()
      .then(({ data: { claims } }) => {
        if (claims) {
          setClaims(claims);
          fetchProfile(claims.sub);
        }
      })
      .finally(() => setLoading(false));

    // Future auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims()?.then(async ({ data }) => {
        const claims = data?.claims ?? null;
        
        setClaims(claims);
        if (claims) {
          // Check if profile row exists
          const { data: existing } = await supabase
            .from("users")
            .select("user_id")
            .eq("user_id", claims.sub)
            .single();

          // Create it if not (new sign-up)
          if (!existing) {
            await supabase.from("users").insert({
              user_id: claims.sub,
              email: claims.email,
              name: claims.user_metadata?.name ?? null,
            });
          }

          fetchProfile(claims.sub);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setClaims();
    setProfile();
  };

  return (
    <AuthContext.Provider
      value={{ claims, profile, loading, signOut, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
