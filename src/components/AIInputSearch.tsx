"use client";

import { Globe, Paperclip, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
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
    minHeight: 90,  // Increased height for better readability
    maxHeight: 350,  // Increased max height to accommodate larger text
  });
  const [showSearch, setShowSearch] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
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
    <div className="w-full py-4">
      <div className="relative max-w-xl w-full mx-auto">
        <div
          role="textbox"
          tabIndex={0}
          aria-label="Search input container"
          className={cn(
            "relative flex flex-col rounded-xl transition-all duration-200 w-full text-left cursor-text",
            "ring-1 ring-black/10 dark:ring-white/10",
            isFocused && "ring-black/20 dark:ring-white/20"
          )}
          onClick={handleContainerClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleContainerClick();
            }
          }}
        >
          <div className="overflow-y-auto max-h-[200px]">
            <Textarea
              id="ai-input-04"
              value={value}
              placeholder="say whatever"
              className="w-full min-h-[90px] rounded-xl rounded-b-none px-4 py-2 bg-white border border-gray-200 text-gray-900 text-xl placeholder:text-gray-400 resize-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 leading-relaxed shadow-sm"
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

          <div className="h-12 bg-white border-t border-gray-200 rounded-b-xl">
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              <label className="cursor-pointer rounded-lg p-2 bg-gray-100 hover:bg-gray-200 transition-colors">
                <input type="file" className="hidden" />
                <Paperclip className="w-4 h-4 text-gray-500 hover:text-gray-700 transition-colors" />
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(!showSearch);
                }}
                className={cn(
                  "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8 cursor-pointer",
                  showSearch
                    ? "bg-sky-500/15 border-sky-400 text-sky-600"
                    : "bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700"
                )}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <motion.div
                    animate={{
                      rotate: showSearch ? 180 : 0,
                      scale: showSearch ? 1.1 : 1,
                    }}
                    whileHover={{
                      rotate: showSearch ? 180 : 15,
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 25,
                    }}
                  >
                    <Globe
                      className={cn(
                        "w-4 h-4",
                        showSearch
                          ? "text-sky-500"
                          : "text-inherit"
                      )}
                    />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                      }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm overflow-hidden whitespace-nowrap text-sky-500 shrink-0"
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={handleSubmit}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  value
                    ? "bg-sky-500/15 text-sky-600"
                    : "bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
