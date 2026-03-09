import { useAuth } from "../hooks/useAuth";

export default function InviteCode() {
  const { profile } = useAuth();
  const code = profile?.groups?.invite_code;

  function copyToClipboard() {
    navigator.clipboard.writeText(code);
  }

  return (
    <div className="text-sm text-gray-600 flex items-center gap-2">
      <span>Group invite code:</span>
      <span className="font-mono font-bold">{code}</span>
      <button
        onClick={copyToClipboard}
        className="text-blue-600 hover:underline text-xs"
      >
        Copy
      </button>
    </div>
  );
}
