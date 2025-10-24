"use client";

// app/profile/page.tsx (Client Component)
import { Bot, UserIcon, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import ChatbotList from "@/components/profile/ChatbotList";
import { useAuth } from "@/store/auth";
import { useGetChatbots } from "@/services/chatbot";

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: chatbots, isLoading, isError } = useGetChatbots();

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-background to-transparent opacity-30" />
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(black,transparent_70%)]" />
      </div>

      <Navbar />

      <div className="container relative pt-32 pb-16">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Profile Header */}
          <div className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10">
                <UserIcon className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-white mb-2">
                  Welcome, {user?.name || "User"}!
                </h1>
                <p className="font-sans text-gray-400">
                  Manage and create your AI assistants
                </p>
              </div>
            </div>
          </div>

          {/* Create New Button */}
          <Link
            href="/create"
            className="group block relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 transition-all duration-300 hover:border-pink-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 group-hover:from-pink-500/20 via-purple-500/20 to-blue-500/20 transition-all duration-300">
                  <Plus className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-semibold text-white">Create New Assistant</h2>
                  <p className="font-sans text-gray-400">
                    Build a custom AI assistant for your needs
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-pink-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Chatbots List */}
          {isLoading ? (
            <div className="text-gray-400">Loading assistants...</div>
          ) : isError ? (
            <div className="text-red-500">Failed to load assistants.</div>
          ) : chatbots && chatbots.length > 0 ? (
            <ChatbotList chatbots={chatbots} />
          ) : (
            <div className="text-gray-400">No assistants yet. Create one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
