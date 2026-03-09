import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

export default function GroupSetup() {
  const { claims, fetchProfile } = useAuth();
  const [tab, setTab] = useState("create");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({})
      .select()
      .single();

    if (groupError) {
      setError(groupError.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("users")
      .update({ group_id: group.group_id })
      .eq("user_id", claims.sub);

    // Re-fetch profile - group_id is now set → App.jsx route guard shows dashboard
    await fetchProfile(claims.sub);
    setLoading(false);
  };

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    // Get group by invite code
    const { data: group, error: lookupError } = await supabase
      .from("groups")
      .select("group_id")
      .eq("invite_code", inviteCode.trim())
      .single();

    if (lookupError || !group) {
      setError("Invalid code. Please try again later.");
      setLoading(false);
      return;
    }

    await supabase
      .from("users")
      .update({ group_id: group.group_id })
      .eq("user_id", claims.sub);

    await fetchProfile(claims.sub);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Set Up Your Group</h1>
        <p className="text-gray-500 text-sm mb-6">
          Create a new shared dashboard, or join an existing one with an invite
          code.
        </p>
        <div className="flex mb-6 border rounded-lg overflow-hidden">
          <button
            onClick={() => setTab("create")}
            className={`flex-1 py-2 text-sm font-medium ${tab === "create" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Create Group
          </button>
          <button
            onClick={() => setTab("join")}
            className={`flex-1 py-2 text-sm font-medium ${tab === "join" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Join Group
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {tab === "create" ? (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create New Group"}
          </button>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-3"
            />
            <button
              onClick={handleJoin}
              disabled={loading || !inviteCode}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Group"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
