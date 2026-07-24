"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from "@algo-matrix/ui";
import { Bot, Save, Sparkles, MessageSquareQuote, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function AiChatbotPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data } = await api.get("/ai/config");
        setIsEnabled(data.aiEnabled || false);
        setSystemPrompt(
          data.aiSystemPrompt || 
          "You are a helpful customer support assistant for Algo Matrix. You answer questions concisely and politely. If you don't know the answer, you offer to transfer the user to a human agent."
        );
      } catch (error) {
        console.error("Failed to fetch AI config", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (token) fetchConfig();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      await api.post("/ai/config", { aiEnabled: isEnabled, aiSystemPrompt: systemPrompt });
      toast.success("AI Configuration saved successfully!");
    } catch (error) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Chatbot Integration</h1>
        <p className="text-[var(--muted-foreground)]">Configure your automated OpenAI assistant to reply to incoming WhatsApp messages 24/7.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-5 w-5 text-[var(--primary)]" />
              Automated AI Agent
            </CardTitle>
            <p className="text-sm text-[var(--muted-foreground)]">
              When enabled, incoming messages will be processed by OpenAI and replied to instantly.
            </p>
          </div>
          <button 
            disabled={isLoading}
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${isEnabled ? 'bg-[var(--primary)]' : 'bg-gray-200 dark:bg-gray-700'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-[var(--muted-foreground)]" />
                  System Prompt (Agent Context)
                </label>
                <textarea
                  className="w-full min-h-[150px] p-4 rounded-lg bg-[var(--accent)]/50 border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none text-sm transition-all resize-y"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Tell the AI how it should behave, what its name is, and how to handle unknown queries..."
                />
                <p className="text-xs text-[var(--muted-foreground)]">
                  This prompt instructs the AI model (GPT-4o-mini) on how to act. Be as specific as possible regarding your business rules.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Fallback Message</label>
                <Input 
                  defaultValue="I'm having trouble understanding. Let me connect you with a human agent." 
                  className="bg-[var(--accent)]/50"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
                  {isSaving ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10 border-[var(--primary)]/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-[var(--primary)] shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)] mb-1">Knowledge Base Sync (Coming Soon)</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Soon you will be able to upload PDFs, URLs, and text documents directly here. We will vectorize the data so the AI can answer customer questions directly from your documentation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
