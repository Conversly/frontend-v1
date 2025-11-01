"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot } from "lucide-react";
import { GoogleAuth } from "@/components/auth";

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInDialog({ isOpen, onClose }: SignInDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dialog after successful authentication
  useEffect(() => {
    if (!isOpen || isAuthLoading) return;
    
    // Check if user just logged in
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem('is-logged-in');
      if (isLoggedIn === 'true') {
        onClose();
      }
    };

    // Check immediately and set up interval
    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 500);

    return () => clearInterval(interval);
  }, [isOpen, isAuthLoading, onClose]);

  const handleAuthLoadingChange = (loading: boolean) => {
    setIsAuthLoading(loading);
    // If loading just finished, check auth status and close if logged in
    if (!loading) {
      setTimeout(() => {
        const isLoggedIn = localStorage.getItem('is-logged-in');
        if (isLoggedIn === 'true') {
          onClose();
        }
      }, 100);
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="sr-only">Sign in to Conversly</DialogTitle>
        </DialogHeader>
        <AnimatePresence>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>

            {/* Branding Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 text-center"
            >
              <div className="mx-auto w-12 h-12 mb-4 text-primary">
                <Bot size={48} />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Conversly</h2>
              <p className="text-muted-foreground">
                Building Smarter Conversations
              </p>
            </motion.div>

            {/* Auth Section */}
            <div className="p-6">
              <div className="flex justify-center">
                <GoogleAuth onLoadingChange={handleAuthLoadingChange} />
              </div>
              
              {/* Marketing Points */}
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Join innovative teams using Conversly
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <MarketingPoint
                    title="AI-Powered Chats"
                    description="Smart conversations"
                  />
                  <MarketingPoint
                    title="Quick Setup"
                    description="Ready in minutes"
                  />
                  <MarketingPoint
                    title="Deep Insights"
                    description="Understand users"
                  />
                  <MarketingPoint
                    title="Custom Training"
                    description="Your data, your way"
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function MarketingPoint({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}