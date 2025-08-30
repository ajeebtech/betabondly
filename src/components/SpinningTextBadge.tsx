"use client";

import { SpinningText } from "./magicui/spinning-text";

export function SpinningTextBadge() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
        <SpinningText>coming soon • coming soon • coming soon •</SpinningText>
      </div>
    </div>
  );
}
