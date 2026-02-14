"use client";

import { useRef, useCallback, useEffect, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  maxLength,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const isInternalUpdate = useRef(false);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
        updateCharCount();
      }
    }
  }, [value]);

  function updateCharCount() {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setCharCount(text.trim().length);
    }
  }

  function checkActiveFormats() {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("insertUnorderedList")) formats.add("ul");
    if (document.queryCommandState("insertOrderedList")) formats.add("ol");

    const block = document.queryCommandValue("formatBlock");
    if (block === "h2") formats.add("h2");
    if (block === "h3") formats.add("h3");
    if (block === "blockquote") formats.add("quote");

    setActiveFormats(formats);
  }

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === "<br>" ? "" : html);
      updateCharCount();
      checkActiveFormats();
      // Reset after a tick to allow external value changes
      requestAnimationFrame(() => {
        isInternalUpdate.current = false;
      });
    }
  }, [onChange]);

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
    checkActiveFormats();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Bold: Ctrl/Cmd + B
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      execCommand("bold");
    }
    // Italic: Ctrl/Cmd + I
    if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault();
      execCommand("italic");
    }
  }

  function handleSelectionChange() {
    checkActiveFormats();
  }

  function insertLink() {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }

  const showPlaceholder = !isFocused && charCount === 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 transition-colors focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 dark:border-gray-700 dark:focus-within:border-amber-600 dark:focus-within:ring-amber-900/30">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800/50">
        {/* Bold */}
        <ToolbarButton
          onClick={() => execCommand("bold")}
          active={activeFormats.has("bold")}
          title="Bold (Ctrl+B)"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => execCommand("italic")}
          active={activeFormats.has("italic")}
          title="Italic (Ctrl+I)"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0l-4 16m0 0h4" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* H2 */}
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "h2")}
          active={activeFormats.has("h2")}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>

        {/* H3 */}
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "h3")}
          active={activeFormats.has("h3")}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Bullet List */}
        <ToolbarButton
          onClick={() => execCommand("insertUnorderedList")}
          active={activeFormats.has("ul")}
          title="Bullet List"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </ToolbarButton>

        {/* Numbered List */}
        <ToolbarButton
          onClick={() => execCommand("insertOrderedList")}
          active={activeFormats.has("ol")}
          title="Numbered List"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003h12m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H4.372m-3.279 7.394v-.713c0-.44.353-.805.806-.81l.97-.003a.725.725 0 01.144 1.436l-1.47.549M3.12 19.967l-.01.064a.793.793 0 00.676.91l.293.048a.618.618 0 00.71-.515l.018-.11" />
          </svg>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={insertLink}
          title="Insert Link"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L5.07 8.65" />
          </svg>
        </ToolbarButton>

        {/* Quote */}
        <ToolbarButton
          onClick={() => execCommand("formatBlock", "blockquote")}
          active={activeFormats.has("quote")}
          title="Quote"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5 3.871 3.871 0 01-2.748-1.179z" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="relative">
        {showPlaceholder && (
          <div className="pointer-events-none absolute left-4 top-4 text-sm text-gray-400 dark:text-gray-500">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => {
            setIsFocused(true);
            checkActiveFormats();
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          onSelect={handleSelectionChange}
          className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] resize-y overflow-auto p-4 text-sm leading-relaxed text-gray-900 outline-none dark:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-gray-400 [&_a]:text-amber-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
          role="textbox"
          aria-multiline="true"
          aria-label="Rich text editor"
        />
      </div>

      {/* Footer with character count */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800/50">
        <span className="text-[10px] text-gray-400">
          Rich text formatting supported
        </span>
        <span
          className={`text-xs ${
            maxLength && charCount > maxLength
              ? "font-medium text-red-500"
              : "text-gray-400"
          }`}
        >
          {charCount}
          {maxLength ? `/${maxLength.toLocaleString()}` : ""} characters
        </span>
      </div>
    </div>
  );
}
