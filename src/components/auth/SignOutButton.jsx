import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "@tremor/react";
import { Toaster, toast } from "sonner";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <>
      <Toaster richColors position="top-center" />
      <Button
        disabled={loading}
        variant="secondary"
        color="red"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </>
  );
}
