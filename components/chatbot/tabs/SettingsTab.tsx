'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteChatbot } from "@/lib/api/chatbot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function SettingsTab({ chatbotId, chatbot }: { chatbotId: string; chatbot: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteChatbot({ id: Number(chatbotId) });
      if(!response.success) {
        toast.error(response.message);
      }
      toast.success("Chatbot deleted successfully");
      router.push('/profile'); // Redirect to profile after deletion
    } catch (error) {
      toast.error("Failed to delete chatbot");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b pb-6">
        <h3 className="text-xl font-semibold mb-4">Danger Zone</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Chatbot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Delete Chatbot
              </DialogTitle>
              <DialogDescription className="pt-4">
                <p className="mb-4">
                  Are you sure you want to delete <strong>{chatbot.name}</strong>? This action cannot be undone.
                </p>
                <div className="bg-destructive/10 p-4 rounded-lg text-sm">
                  <p className="font-medium text-destructive mb-2">This will:</p>
                  <ul className="list-disc list-inside space-y-1 text-destructive/90">
                    <li>Delete all chatbot data permanently</li>
                    <li>Remove all associated knowledge base content</li>
                    <li>Delete all conversation history</li>
                    <li>Remove all custom configurations</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Chatbot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 