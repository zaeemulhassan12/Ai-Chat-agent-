"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpIcon, AudioLinesIcon, SquareIcon, Mic, MicOff, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Composer({
  onSend,
  onStop,
  onVoice,
  isVoiceActive,
  streaming,
  disabled,
  placeholder = `Message ${APP_CONFIG.appName}…`,
  autoFocus,
}: {
  onSend: (text: string, image?: string) => void;
  onStop: () => void;
  /** When set, an empty composer shows a "Start voice mode" button instead of Send. */
  onVoice?: () => void;
  isVoiceActive?: boolean;
  streaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && window.matchMedia("(min-width: 768px)").matches) ref.current?.focus();
  }, [autoFocus]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (streaming) return onStop();
    if ((!value.trim() && !image) || disabled) return;
    onSend(value, image ?? undefined);
    setValue("");
    setImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const touch = window.matchMedia("(hover: none)").matches;
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !touch) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = streaming || (!!value.trim() && !disabled);
  const showVoice = !!onVoice && !streaming && !value.trim();

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-3xl rounded-3xl border bg-card p-2.5 pl-4 shadow-sm transition-colors focus-within:border-ring"
    >
      {image && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-xl border bg-muted p-1.5">
          <img src={image} alt="Attachment" className="max-h-20 rounded-lg object-cover" />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-6 shrink-0 rounded-full p-0 hover:bg-destructive/20 hover:text-destructive"
            onClick={() => setImage(null)}
          >
            <X className="size-3" />
          </Button>
        </div>
      )}
      <label htmlFor="composer" className="sr-only">
        Message
      </label>
      <div className="flex items-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full"
            >
              <ImagePlus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach image</TooltipContent>
        </Tooltip>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        <textarea
          id="composer"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          enterKeyHint="send"
          className="field-sizing-content max-h-52 min-h-7 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="mt-1 flex items-center justify-end gap-2">
        {!!onVoice && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                onClick={onVoice}
                aria-label={isVoiceActive ? "Stop voice chat" : "Start voice chat"}
                className={cn(
                  "rounded-full transition-all duration-200",
                  isVoiceActive && "bg-destructive text-destructive-foreground animate-pulse"
                )}
              >
                {isVoiceActive ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isVoiceActive ? "Stop voice chat" : "Start voice chat"}</TooltipContent>
          </Tooltip>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label={streaming ? "Stop generating" : "Send message"}
          className={cn("rounded-full", !canSend && "opacity-30")}
        >
          {streaming ? <SquareIcon className="size-3.5 fill-current" /> : <ArrowUpIcon />}
        </Button>
      </div>
    </form>
  );
}
