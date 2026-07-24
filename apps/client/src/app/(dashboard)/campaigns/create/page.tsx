"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Button, Input, Card, 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@algo-matrix/ui";
import { ArrowLeft, ArrowRight, Save, Send, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useCampaignsStore } from "@/store/useCampaignsStore";
import { useTemplatesStore } from "@/store/useTemplatesStore";

const WIZARD_STEPS = [
  "Campaign Info",
  "Select Template",
  "Audience Selection",
  "Variable Mapping",
  "Schedule",
  "Review & Launch"
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const { createCampaign, launchCampaign } = useCampaignsStore();
  const { templates, fetchTemplates } = useTemplatesStore();
  
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [audienceType, setAudienceType] = useState("ALL");
  const [audienceTags, setAudienceTags] = useState("");
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [scheduleType, setScheduleType] = useState("NOW");

  useEffect(() => {
    fetchTemplates({ limit: 100 }); // fetch all for the dropdown
  }, []);

  const handleNext = () => {
    if (step === 0 && !name.trim()) return alert("Please enter a campaign name");
    if (step === 1 && !templateId) return alert("Please select a template");
    if (step === 2 && audienceType === "TAG" && !audienceTags.trim()) return alert("Please enter tags");
    
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      await createCampaign({
        name,
        templateId: templateId || undefined,
        audience: { type: audienceType, tags: audienceTags.split(',').map(t => t.trim()).filter(Boolean) },
        variables,
        status: "DRAFT"
      });
      router.push("/campaigns");
    } catch (e) {
      alert("Failed to save draft");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunch = async () => {
    try {
      setSubmitting(true);
      const campaign = await createCampaign({
        name,
        templateId,
        audience: { type: audienceType, tags: audienceTags.split(',').map(t => t.trim()).filter(Boolean) },
        variables,
        status: scheduleType === "NOW" ? "DRAFT" : "SCHEDULED" // we launch draft to running
      });

      if (scheduleType === "NOW") {
        await launchCampaign(campaign.id);
      }
      
      router.push("/campaigns");
    } catch (e) {
      alert("Failed to launch campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === templateId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/campaigns">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaign Builder</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Step {step + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[step]}</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-[var(--border)] before:z-0">
        {WIZARD_STEPS.map((label, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 
              ${step === index ? "bg-primary text-primary-foreground border-primary" : 
                step > index ? "bg-primary text-primary-foreground border-primary" : 
                "bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]"}`}>
              {step > index ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${step === index ? "text-primary" : "text-[var(--muted-foreground)]"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <Card className="p-8 mt-8 min-h-[400px]">
        {/* Step 1: Campaign Info */}
        {step === 0 && (
          <div className="space-y-6 max-w-xl mx-auto pt-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">What is this campaign about?</h2>
              <p className="text-[var(--muted-foreground)] text-sm">Give your campaign a memorable name for internal tracking.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Name</label>
              <Input 
                placeholder="e.g. Summer Sale 2024" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 2: Select Template */}
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto pt-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Select a Message Template</h2>
              <p className="text-[var(--muted-foreground)] text-sm">Only approved templates can be used in campaigns.</p>
            </div>
            <div className="space-y-4">
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an approved template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.status === 'APPROVED' || t.status === 'SUBMITTED' || t.status === 'DRAFT').map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <div className="p-4 border rounded-md bg-[var(--accent)]/30 mt-4 text-sm">
                  <h4 className="font-semibold mb-2">Template Preview</h4>
                  <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">
                    {selectedTemplate.components?.find(c => c.type === 'BODY')?.text || "No body text"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Audience Selection */}
        {step === 2 && (
          <div className="space-y-6 max-w-xl mx-auto pt-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Who should receive this?</h2>
              <p className="text-[var(--muted-foreground)] text-sm">Select the audience segment for this broadcast.</p>
            </div>
            <div className="space-y-4">
              <Select value={audienceType} onValueChange={setAudienceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Contacts</SelectItem>
                  <SelectItem value="TAG">Filter by Tags</SelectItem>
                </SelectContent>
              </Select>

              {audienceType === "TAG" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input 
                    placeholder="e.g. VIP, leads, summer_promo" 
                    value={audienceTags}
                    onChange={e => setAudienceTags(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Variable Mapping */}
        {step === 3 && (
          <div className="space-y-6 max-w-xl mx-auto pt-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Variable Mapping</h2>
              <p className="text-[var(--muted-foreground)] text-sm">Map template variables to contact properties.</p>
            </div>
            
            {(() => {
              const body = selectedTemplate?.components?.find(c => c.type === 'BODY')?.text || "";
              const matches = body.match(/{{\d+}}/g) || [];
              const uniqueVars = Array.from(new Set(matches));

              if (uniqueVars.length === 0) {
                return (
                  <div className="p-4 border rounded-md bg-[var(--accent)]/30 text-center text-[var(--muted-foreground)]">
                    This template has no variables to map.
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {uniqueVars.map((v) => (
                    <div key={v} className="grid grid-cols-[100px_1fr] items-center gap-4">
                      <div className="font-mono bg-blue-100 text-blue-800 text-center rounded px-2 py-1 text-sm">{v}</div>
                      <Select 
                        value={variables[v] || ""} 
                        onValueChange={(val) => setVariables(prev => ({...prev, [v]: val}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="firstName">First Name</SelectItem>
                          <SelectItem value="lastName">Last Name</SelectItem>
                          <SelectItem value="phone">Phone Number</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Step 5: Schedule */}
        {step === 4 && (
          <div className="space-y-6 max-w-xl mx-auto pt-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">When should we send this?</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={scheduleType === "NOW" ? "default" : "outline"} 
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setScheduleType("NOW")}
                >
                  <Send className="h-6 w-6" />
                  Send Immediately
                </Button>
                <Button 
                  variant={scheduleType === "LATER" ? "default" : "outline"} 
                  className="h-24 flex flex-col gap-2"
                  onClick={() => setScheduleType("LATER")}
                  disabled
                >
                  <Clock className="h-6 w-6" />
                  Schedule for Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 5 && (
          <div className="space-y-6 max-w-2xl mx-auto pt-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold">Ready to Launch!</h2>
              <p className="text-[var(--muted-foreground)]">Review your campaign details before sending.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-sm text-[var(--muted-foreground)]">Campaign Name</span>
                <p className="font-medium">{name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-[var(--muted-foreground)]">Template</span>
                <p className="font-medium">{selectedTemplate?.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-[var(--muted-foreground)]">Audience</span>
                <p className="font-medium">{audienceType === 'ALL' ? 'All Contacts' : `Tags: ${audienceTags}`}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-[var(--muted-foreground)]">Schedule</span>
                <p className="font-medium">{scheduleType === 'NOW' ? 'Immediately' : 'Scheduled'}</p>
              </div>
            </div>
          </div>
        )}

      </Card>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={step === 0 || submitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={handleSaveDraft} disabled={submitting}>
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          
          {step < WIZARD_STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} disabled={submitting} size="lg">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Launch Campaign
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
