'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaCode,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaUndo,
  FaRedo,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaImage,
} from 'react-icons/fa';

/**
 * RichTextEditor Component (Powered by TipTap)
 * Features: Modern, React 19 Compatible, Fully Customizable.
 * Controls: Headings, Bold, Italic, Underline, Colors, Lists, Tables, Images, Code Blocks, and more.
 * Design: Strictly rounded-none to match My Pharma Admin style.
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Provide authoritative medicine details...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border-2 border-gray-100 font-inter text-sm',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (typeof value === 'string' && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="w-full h-[300px] bg-gray-50 border-2 border-gray-100 flex items-center justify-center">
        <span className="font-mono text-xs font-bold text-gray-400 uppercase animate-pulse">
          Loading_TipTap_Editor...
        </span>
      </div>
    );
  }

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      className={`p-2 border border-gray-200 hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-200' : ''
      }`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="w-full tiptap-wrapper">
      <style jsx>{`
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0.5rem 0;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.5rem 0;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
          line-height: 1.4;
        }
        .ProseMirror h4 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        .ProseMirror h5 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        .ProseMirror h6 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.25rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-2 border-gray-100 border-b-0">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <FaBold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <FaItalic />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <FaUnderline />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <FaStrikethrough />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <FaCode />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <select
          value={
            editor.isActive('paragraph')
              ? '0'
              : editor.isActive('heading', { level: 1 })
                ? '1'
                : editor.isActive('heading', { level: 2 })
                  ? '2'
                  : editor.isActive('heading', { level: 3 })
                    ? '3'
                    : editor.isActive('heading', { level: 4 })
                      ? '4'
                      : editor.isActive('heading', { level: 5 })
                        ? '5'
                        : editor.isActive('heading', { level: 6 })
                          ? '6'
                          : '0'
          }
          onChange={e => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level }).run();
            }
          }}
          className="p-1 border border-gray-200 text-sm"
        >
          <option value={0}>Paragraph</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
          <option value={4}>Heading 4</option>
          <option value={5}>Heading 5</option>
          <option value={6}>Heading 6</option>
        </select>

        <input
          type="color"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 border border-gray-200 cursor-pointer"
          title="Text Color"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <FaListUl />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <FaListOl />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <FaQuoteLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <FaCode />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <FaAlignLeft />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <FaAlignCenter />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <FaAlignRight />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify"
        >
          <FaAlignJustify />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          title="Image"
        >
          <FaImage />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <FaUndo />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <FaRedo />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="border-2 border-gray-100 border-t-0"
      />
    </div>
  );
};

export default RichTextEditor;
