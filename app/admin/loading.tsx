import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-[#0B4A2E] animate-spin" />
        <p className="text-xs text-muted">Loading...</p>
      </div>
    </div>
  );
}
