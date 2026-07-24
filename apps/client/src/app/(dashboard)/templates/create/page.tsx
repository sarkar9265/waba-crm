"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Button, Input, Card, Textarea,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@algo-matrix/ui";
import { ArrowLeft, Send, Image as ImageIcon, Smile, Paperclip, FileText, Loader2 } from "lucide-react";
import { useTemplatesStore, TemplateComponent } from "@/store/useTemplatesStore";

export default function CreateTemplatePage() {
  const router = useRouter();
  const { createTemplate } = useTemplatesStore();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("MARKETING");
  const [language, setLanguage] = useState("en_US");
  
  const [headerType, setHeaderType] = useState("NONE");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("Hi {{1}},\n\nThanks for choosing us! Your order {{2}} is confirmed.");
  const [footerText, setFooterText] = useState("Reply STOP to unsubscribe");

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (isDraft: boolean) => {
    if (!name.trim()) return alert("Template name is required.");
    if (!bodyText.trim()) return alert("Template body is required.");

    setSubmitting(true);

    const components: TemplateComponent[] = [];

    if (headerType !== "NONE") {
      components.push({
        type: "HEADER",
        format: headerType as any,
        text: headerType === "TEXT" ? headerText : undefined
      });
    }

    components.push({
      type: "BODY",
      text: bodyText
    });

    if (footerText) {
      components.push({
        type: "FOOTER",
        text: footerText
      });
    }

    try {
      await createTemplate({
        name,
        category: category as any,
        language,
        status: isDraft ? "DRAFT" : "SUBMITTED",
        components
      });
      router.push("/templates");
    } catch (e) {
      alert("Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] -mx-6 -mt-6 -mb-6 flex overflow-hidden border-t border-[var(--border)]">
      
      {/* Left Column: Form Builder */}
      <div className="flex-1 overflow-y-auto bg-[var(--background)] p-6 border-r border-[var(--border)]">
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
          
          <div className="flex items-center gap-4">
            <Link href="/templates">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Template</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Design your message and submit for Meta approval.</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-lg">Template Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input 
                    placeholder="e.g. holiday_promo_2024" 
                    value={name} 
                    onChange={e => setName(e.target.value.replace(/[^a-z0-9_]/g, ''))} 
                    className="lowercase"
                  />
                  <p className="text-xs text-[var(--muted-foreground)]">Use only lowercase letters, numbers, and underscores.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_US">English (US)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <h3 className="font-semibold text-lg">Template Content</h3>
              <div className="space-y-6">
                
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Header (Optional)</label>
                    <Select value={headerType} onValueChange={setHeaderType}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {headerType === "TEXT" && (
                    <Input 
                      placeholder="Enter header text (max 60 chars)" 
                      value={headerText} 
                      onChange={e => setHeaderText(e.target.value)} 
                      maxLength={60}
                    />
                  )}
                  {(headerType === "IMAGE" || headerType === "DOCUMENT" || headerType === "VIDEO") && (
                    <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                      <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">Media placeholder</p>
                      <p className="text-xs text-center mt-1">You will upload the actual media when sending the campaign.</p>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Body</label>
                    <span className="text-xs text-[var(--muted-foreground)]">{bodyText.length}/1024</span>
                  </div>
                  <Textarea 
                    placeholder="Enter your message body..." 
                    value={bodyText} 
                    onChange={e => setBodyText(e.target.value)}
                    className="min-h-[150px] resize-none"
                    maxLength={1024}
                  />
                  <div className="flex gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>Formatting:</span>
                    <span className="font-semibold">*Bold*</span>
                    <span className="italic">_Italic_</span>
                    <span className="line-through">~Strikethrough~</span>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => setBodyText(prev => prev + " {{1}}")}>
                      Add Variable {"{{1}}"}
                    </Button>
                  </div>
                </div>

                {/* Footer */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Footer (Optional)</label>
                    <span className="text-xs text-[var(--muted-foreground)]">{footerText.length}/60</span>
                  </div>
                  <Input 
                    placeholder="Enter footer text" 
                    value={footerText} 
                    onChange={e => setFooterText(e.target.value)}
                    maxLength={60}
                  />
                </div>

              </div>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" size="lg" disabled={submitting} onClick={() => handleSubmit(true)}>
                Save Draft
              </Button>
              <Button size="lg" disabled={submitting} onClick={() => handleSubmit(false)}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit for Approval
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Right Column: Live Preview Mockup */}
      <div className="w-full lg:w-[450px] shrink-0 bg-[#E5DDD5] dark:bg-[#0b141a] overflow-y-auto hidden md:flex flex-col relative border-l border-[var(--border)]">
        
        {/* Mockup Header */}
        <div className="h-16 bg-[#075e54] dark:bg-[#202c33] flex items-center px-4 shrink-0 shadow-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">W</span>
            </div>
            <div>
              <h2 className="font-semibold text-white leading-tight">WABA CRM Business</h2>
              <p className="text-xs text-white/70">business account</p>
            </div>
          </div>
        </div>

        {/* Mockup Chat Area */}
        <div className="flex-1 p-4 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde539c58cca6745483d4858c52.png')] dark:bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')] bg-repeat bg-center bg-contain opacity-90 absolute inset-0 z-0"></div>
        
        <div className="flex-1 p-4 z-10 overflow-y-auto">
          <div className="flex justify-center my-4">
            <span className="bg-[#e1f3fb] dark:bg-[#182229] px-3 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">
              TODAY
            </span>
          </div>

          <div className="flex flex-col gap-1 items-start max-w-[85%] mx-auto">
            {/* The Message Bubble */}
            <div className="bg-white dark:bg-[#202c33] p-1.5 rounded-xl rounded-tl-sm shadow-sm border border-black/5 dark:border-white/5 relative overflow-hidden">
              
              {/* Media Header Preview */}
              {(headerType === "IMAGE" || headerType === "VIDEO") && (
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                </div>
              )}
              {headerType === "DOCUMENT" && (
                <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center gap-3 px-3">
                  <div className="h-10 w-10 bg-red-100 text-red-500 rounded flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Document.pdf</div>
                </div>
              )}
              
              <div className="p-1.5 pb-2">
                {/* Text Header Preview */}
                {headerType === "TEXT" && headerText && (
                  <h4 className="font-bold text-[#111b21] dark:text-[#e9edef] text-[15px] mb-1 leading-snug">
                    {headerText}
                  </h4>
                )}

                {/* Body Preview */}
                <div className="text-[#111b21] dark:text-[#e9edef] text-[15px] leading-relaxed whitespace-pre-wrap font-sans">
                  {bodyText.split(/({{\d+}})/g).map((part, i) => {
                    if (part.match(/{{\d+}}/)) {
                      return <span key={i} className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-1 rounded mx-0.5">{part}</span>;
                    }
                    return part;
                  })}
                </div>

                {/* Footer Preview */}
                {footerText && (
                  <p className="text-[13px] text-[#667781] dark:text-[#8696a0] mt-1.5 leading-snug">
                    {footerText}
                  </p>
                )}

                <div className="flex justify-end items-center mt-0.5 gap-1 float-right translate-y-1">
                  <span className="text-[11px] text-[#667781] dark:text-[#8696a0]">12:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
