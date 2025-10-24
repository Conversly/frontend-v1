// app/profile/DeleteButton.tsx (Client Component)
"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteChatbot } from "@/services/chatbot";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteButton({ chatbotId }: { chatbotId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { mutateAsync } = useDeleteChatbot();
  const handleDeleteBot = async () => {
    setLoading(true);
    try {
      const result = await mutateAsync({ id: chatbotId });
      if(!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Chatbot deleted successfully");
      // The query invalidation will refresh the list; no redirect needed
    } catch (error) {
      console.error("Failed to delete chatbot", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDeleteBot}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
