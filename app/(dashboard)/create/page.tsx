"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SignInDialog } from "@/components/auth/SignInDialog"
import { Bot, Sparkles, ArrowRight } from "lucide-react"
import { z, type ZodIssue } from "zod"
import { PromptGeneratorForm } from "@/components/create/PromptGeneratorForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useCreateChatbot, useGetInstructions } from "@/services/chatbot"
import { toast } from "sonner"
import Navbar from "@/components/landing/navbar"

export default function CreatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const createChatbotMutation = useCreateChatbot()
  const getInstructionsMutation = useGetInstructions()

  // Basic Info
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("you are a helpful assistant...")
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false)

  const chatbotSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (fieldName: string, value: string) => {
    const fieldSchema = chatbotSchema.shape[fieldName as keyof typeof chatbotSchema.shape]
    const result = (fieldSchema as z.ZodTypeAny).safeParse(value)

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: result.success ? "" : (result.error?.issues?.[0]?.message ?? "Invalid value"),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = chatbotSchema.safeParse({ name, description, systemPrompt })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue: ZodIssue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message
        }
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    // Clear errors if validation passes
    setErrors({})

    try {
      if (!isAuthenticated()) {
        setIsSignInOpen(true)
        return
      }

      const response = await createChatbotMutation.mutateAsync({
        name,
        description,
        systemPrompt,
      })

      toast("Success", {
        description: "Chatbot created successfully!",
      })
      router.push(`/chatbot/${response.id}`)
    } catch (error: any) {
      if (error instanceof Error && error.message.includes("maximum number of chatbots")) {
        toast("Error", { description: "You have reached the maximum number of chatbots allowed." })
      } else {
        toast("Error", { description: error instanceof Error ? error.message : "Failed to create chatbot" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePrompt = async (promptIdea: string) => {
    try {
      const data = await getInstructionsMutation.mutateAsync(promptIdea)
      setSystemPrompt(data.systemPrompt ?? "")
      setIsPromptDialogOpen(false)
    } catch (error) {
      console.error("Error generating prompt:", error)
      toast("Error", { description: "Failed to generate prompt. Please try again." })
    }
  }

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-background to-transparent opacity-30" />
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(black,transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative pt-32 pb-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-6">
              <Bot className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                Create Assistant
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Design Your Perfect
              <span className="block bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                AI Assistant
              </span>
            </h1>
            <p className="text-gray-400 text-lg font-sans">
              Build a customized chatbot trained on your knowledge base
            </p>
          </div>

          {/* Form Section */}
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-8 space-y-8"
          >
            <div className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block font-sans text-sm font-medium text-gray-300 mb-2">
                  Assistant Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    validateField("name", e.target.value)
                  }}
                  placeholder="Enter a name for your assistant"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-pink-500">{errors.name}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block font-sans text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    validateField("description", e.target.value)
                  }}
                  placeholder="Describe what your assistant will help with"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-pink-500">{errors.description}</p>
                )}
              </div>

              {/* System Prompt Field */}
              <div>
                <label className="block font-sans text-sm font-medium text-gray-300 mb-2">
                  System Prompt
                </label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => {
                    setSystemPrompt(e.target.value)
                    validateField("systemPrompt", e.target.value)
                  }}
                  placeholder="Define your assistant's personality and behavior"
                  className="min-h-[150px] bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500"
                />
                {errors.systemPrompt && (
                  <p className="mt-2 text-sm text-pink-500">{errors.systemPrompt}</p>
                )}
                <p className="mt-2 text-sm text-gray-400">
                  This prompt shapes your assistant's personality and expertise.
                </p>
              </div>

              {/* Generate Prompt Button */}
              <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full border-gray-800 text-white hover:bg-gray-800/50"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-pink-500" />
                    Generate Prompt
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Generate System Prompt</DialogTitle>
                  </DialogHeader>
                  <PromptGeneratorForm onGenerate={handleGeneratePrompt} />
                </DialogContent>
              </Dialog>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 rounded-xl group"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Assistant"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
      <SignInDialog isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  )
}

