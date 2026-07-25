import { useState, useMemo } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Input, Label, Button
} from "@algo-matrix/ui";
import { Template } from "@/store/useTemplatesStore";
import { Image as ImageIcon, FileText, Video, ExternalLink, Phone } from "lucide-react";

interface TemplatePreviewModalProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemplatePreviewModal({ template, open, onOpenChange }: TemplatePreviewModalProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const header = template.components?.find(c => c.type === 'HEADER');
  const body = template.components?.find(c => c.type === 'BODY');
  const footer = template.components?.find(c => c.type === 'FOOTER');
  const buttons = template.components?.find(c => c.type === 'BUTTONS');

  // Extract variables like {{1}}, {{2}} from body text
  const variables = useMemo(() => {
    if (!body?.text) return [];
    const matches = body.text.match(/\{{\d+\}}/g);
    return matches ? Array.from(new Set(matches)) : [];
  }, [body?.text]);

  const previewText = useMemo(() => {
    if (!body?.text) return "";
    let text = body.text;
    variables.forEach(v => {
      text = text.replace(new RegExp(v, 'g'), variableValues[v] || `[${v}]`);
    });
    return text;
  }, [body?.text, variables, variableValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl flex flex-col md:flex-row gap-0 p-0 overflow-hidden bg-[var(--background)]">
        
        {/* Left Side - Variable Inputs */}
        <div className="flex-1 p-6 border-r border-[var(--border)] overflow-y-auto max-h-[80vh]">
          <DialogHeader className="mb-6">
            <DialogTitle>Preview Template</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Name:</span> {template.name}</div>
                <div><span className="font-medium">Category:</span> {template.category}</div>
                <div><span className="font-medium">Language:</span> {template.language}</div>
                <div><span className="font-medium">Status:</span> {template.status}</div>
              </div>
            </div>

            {variables.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Variable Mapping</h3>
                <div className="space-y-4">
                  {variables.map(v => (
                    <div key={v} className="space-y-1">
                      <Label className="text-xs">Variable {v}</Label>
                      <Input 
                        placeholder={`Enter value for ${v}`}
                        value={variableValues[v] || ''}
                        onChange={(e) => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {variables.length === 0 && (
              <div className="text-sm text-[var(--muted-foreground)] italic">
                This template has no variables.
              </div>
            )}
          </div>
        </div>

        {/* Right Side - WhatsApp Preview */}
        <div className="flex-1 bg-[#efeae2] p-6 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-full max-w-[320px]">
            {/* Chat Bubble */}
            <div className="bg-white rounded-lg rounded-tl-none shadow-sm p-2 mb-2 relative">
              
              {/* Header Media */}
              {header?.format === 'IMAGE' && (
                <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-8 w-8 mb-1" />
                </div>
              )}
              {header?.format === 'VIDEO' && (
                <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">
                  <Video className="h-8 w-8 mb-1" />
                </div>
              )}
              {header?.format === 'DOCUMENT' && (
                <div className="w-full h-16 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 gap-2">
                  <FileText className="h-6 w-6" /> <span className="text-sm font-medium">Document Preview</span>
                </div>
              )}
              {header?.format === 'TEXT' && header.text && (
                <div className="font-bold text-gray-800 mb-1">{header.text}</div>
              )}

              {/* Body Text */}
              <div className="text-[#111b21] text-[15px] whitespace-pre-wrap leading-tight">
                {previewText}
              </div>

              {/* Footer */}
              {footer?.text && (
                <div className="text-[13px] text-gray-500 mt-1 uppercase tracking-wide">
                  {footer.text}
                </div>
              )}
              
              {/* Timestamp */}
              <div className="text-[11px] text-gray-400 text-right mt-1">
                12:00 PM
              </div>
            </div>

            {/* Buttons */}
            {buttons?.buttons && buttons.buttons.length > 0 && (
              <div className="flex flex-col gap-1">
                {buttons.buttons.map((btn, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm p-3 text-center text-[#00a884] font-medium text-[15px] flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                    {btn.type === 'URL' && <ExternalLink className="h-4 w-4" />}
                    {btn.type === 'PHONE_NUMBER' && <Phone className="h-4 w-4" />}
                    {btn.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
