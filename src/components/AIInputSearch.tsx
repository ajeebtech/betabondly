"use client";

import { Paperclip, Send } from "lucide-react";
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const useAutoResizeTextarea = (options: { minHeight: number; maxHeight: number }) => {
  const { minHeight, maxHeight } = options;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (reset = false) => {
    if (!textareaRef.current) return;
    
    if (reset) {
      textareaRef.current.style.height = `${minHeight}px`;
      return;
    }

    textareaRef.current.style.height = 'auto';
    const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, minHeight), maxHeight);
    textareaRef.current.style.height = `${newHeight}px`;
  };

  return { textareaRef, adjustHeight };
};

export default function AIInputSearch() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 100,
    maxHeight: 300,
  });
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;
    // Handle submission here
    console.log("Submitted:", value);
    setValue("");
    adjustHeight(true);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full">
        <div
          role="textbox"
          tabIndex={0}
          aria-label="Search input container"
          className={cn(
            "relative flex flex-col bg-white rounded-xl shadow-sm overflow-hidden w-full text-left cursor-text",
            "border border-gray-200",
            isFocused && "ring-2 ring-pink-500 ring-offset-1"
          )}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleContainerClick();
            }
          }}
        >
          <div className="overflow-y-auto max-h-[200px] p-4">
            <Textarea
              id="ai-input-04"
              value={value}
              placeholder="What's on your mind?"
              className="w-full min-h-[100px] border-0 p-0 text-gray-900 text-base placeholder:text-gray-400 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
              ref={textareaRef}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
            />
          </div>

          <div className="h-12 bg-gray-50 border-t border-gray-200 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button 
                type="button"
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle attachment click
                }}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={!value.trim()}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                value.trim()
                  ? "bg-pink-500 text-white hover:bg-pink-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <span>Post</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
