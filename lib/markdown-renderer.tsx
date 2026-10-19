import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renderizador de Markdown puro, seguro e leve.
 * Converte blocos Markdown (títulos, listas, parágrafos, ênfases) em elementos React nativos
 * com sanitização intrínseca (sem dangerouslySetInnerHTML).
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return null;
  }

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentListItems: string[] = [];
  let currentListType: "ul" | "ol" | null = null;
  let elementIndex = 0;

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      if (currentListType === "ul") {
        elements.push(
          <ul
            key={`list-${elementIndex++}`}
            className="my-3 list-disc space-y-1.5 pl-5 text-sm text-foreground/90 leading-relaxed"
          >
            {currentListItems.map((item, i) => (
              <li key={`ul-item-${i}`}>{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol
            key={`list-${elementIndex++}`}
            className="my-3 list-decimal space-y-1.5 pl-5 text-sm text-foreground/90 leading-relaxed"
          >
            {currentListItems.map((item, i) => (
              <li key={`ol-item-${i}`}>{renderInlineMarkdown(item)}</li>
            ))}
          </ol>
        );
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${elementIndex++}`}
          className="mt-4 mb-2 text-base font-semibold text-foreground tracking-tight"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${elementIndex++}`}
          className="mt-5 mb-2 text-lg font-bold text-foreground tracking-tight border-b border-border/40 pb-1"
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={`h1-${elementIndex++}`}
          className="mt-6 mb-3 text-xl font-extrabold text-foreground tracking-tight"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    // Unordered list items: "- " or "* "
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (currentListType && currentListType !== "ul") {
        flushList();
      }
      currentListType = "ul";
      currentListItems.push(trimmed.slice(2));
      continue;
    }

    // Ordered list items: "1. " or "2. "
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (currentListType && currentListType !== "ol") {
        flushList();
      }
      currentListType = "ol";
      currentListItems.push(orderedMatch[2]);
      continue;
    }

    // Blockquote: "> "
    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${elementIndex++}`}
          className="my-3 border-l-4 border-primary/50 bg-muted/30 py-2 px-3.5 rounded-r-md text-sm italic text-muted-foreground"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${elementIndex++}`}
        className="my-2.5 text-sm text-foreground/90 leading-relaxed"
      >
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 text-left ${className}`}>{elements}</div>;
}

/**
 * Converte marcadores inline (**negrito**, *itálico*, `código`) em elementos React seguros.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex para capturar **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Check for bold: **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)$/);
    // Check for inline code: `code`
    const codeMatch = remaining.match(/^([\s\S]*?)`([^`]+)`([\s\S]*)$/);
    // Check for italic: *text* or _text_
    const italicMatch = remaining.match(/^([\s\S]*?)\*([^*]+)\*([\s\S]*)$/);

    // Identify which pattern appears earliest
    const candidates = [
      boldMatch ? { type: "bold", prefix: boldMatch[1], content: boldMatch[2], rest: boldMatch[3], pos: boldMatch[1].length } : null,
      codeMatch ? { type: "code", prefix: codeMatch[1], content: codeMatch[2], rest: codeMatch[3], pos: codeMatch[1].length } : null,
      italicMatch ? { type: "italic", prefix: italicMatch[1], content: italicMatch[2], rest: italicMatch[3], pos: italicMatch[1].length } : null,
    ].filter((c): c is NonNullable<typeof c> => c !== null);

    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }

    // Sort by earliest match in the string
    candidates.sort((a, b) => a.pos - b.pos);
    const first = candidates[0];

    if (first.prefix) {
      parts.push(first.prefix);
    }

    if (first.type === "bold") {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-foreground">
          {first.content}
        </strong>
      );
    } else if (first.type === "code") {
      parts.push(
        <code
          key={`c-${keyIdx++}`}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground border border-border/50"
        >
          {first.content}
        </code>
      );
    } else if (first.type === "italic") {
      parts.push(
        <em key={`i-${keyIdx++}`} className="italic text-foreground">
          {first.content}
        </em>
      );
    }

    remaining = first.rest;
  }

  return <>{parts}</>;
}
