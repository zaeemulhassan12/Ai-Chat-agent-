"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpIcon, AudioLinesIcon, SquareIcon, Mic, MicOff } from "lucide-react";

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
  onSend: (text: string) => void;
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
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && window.matchMedia("(min-width: 768px)").matches) ref.current?.focus();
  }, [autoFocus]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (streaming) return onStop();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
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
      <label htmlFor="composer" className="sr-only">
        Message
      </label>
      <textarea
        id="composer"
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        enterKeyHint="send"
        className="field-sizing-content max-h-52 min-h-7 w-full resize-none bg-transparent py-1.5 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
      />
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
