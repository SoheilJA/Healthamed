import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface CopyButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  text: string;
  label?: string;
}

export function CopyButton({ text, label, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copy}
      aria-live="polite"
      {...props}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {label && <span>{copied ? "کپی شد" : label}</span>}
    </Button>
  );
}
