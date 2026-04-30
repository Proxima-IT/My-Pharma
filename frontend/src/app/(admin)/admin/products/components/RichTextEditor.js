'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiRotateCcw,
  FiRotateCw,
} from 'react-icons/fi';

/**
 * RichTextEditor Component
 * Refactored to align with the latest official TipTap documentation.
 *
 * CRITICAL FIX FOR COLOR PERSISTENCE:
 * Standard Markdown does not support colors. To save color data while using Markdown storage,
 * we enable 'html: true' in the Markdown extension. This allows the editor to embed
 * <span style="color: ..."> tags inside the Markdown string, preserving your selections in the DB.
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Write product description here...',
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Heading configuration as per official docs
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      // TextStyle and Color as per official docs
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Markdown.configure({
        html: true, // REQUIRED: Allows <span> tags for color to be saved in the Markdown string
        tightLists: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-6 font-sans text-black uppercase',
      },
    },
    onUpdate: ({ editor }) => {
      // Logic: Get content as Markdown (now including HTML color spans where applicable)
      const markdown = editor.storage.markdown.getMarkdown();
      if (onChange) {
        onChange(markdown);
      }
    },
  });

  // Keep editor in sync with external state (e.g. during product edits)
  useEffect(() => {
    if (
      editor &&
      value !== undefined &&
      value !== editor.storage.markdown.getMarkdown()
    ) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    title,
    children,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-3 border border-gray-100 transition-all cursor-pointer flex items-center justify-center gap-1 rounded-none ${
        isActive
          ? 'bg-black text-white'
          : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
      title={title}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );

  return (
    <div className="w-full border-2 border-gray-100 bg-white group focus-within:border-black transition-all rounded-none shadow-none">
      {/* Unified Toolbar */}
      <div className="flex flex-wrap bg-gray-50 border-b border-gray-100 p-1 gap-1 sticky top-0 z-10">
        <ToolbarButton
          icon={FiBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        />
        <ToolbarButton
          icon={FiItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        />
        <ToolbarButton
          icon={FiUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        />

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        {/* Headings */}
        {[1, 2, 3].map(level => (
          <ToolbarButton
            key={level}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level }).run()
            }
            isActive={editor.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            <span className="text-[10px] font-black">H{level}</span>
          </ToolbarButton>
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        {/* Lists */}
        <ToolbarButton
          icon={FiList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet Points"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <span className="text-[10px] font-black">1.</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        {/* Color Palette - Updated to use official .setColor() command */}
        <div className="flex items-center gap-1 px-2 border border-gray-100 bg-white">
          {[
            { name: 'Black', color: '#000000' },
            { name: 'Blue', color: '#1D3583' },
            { name: 'Green', color: '#10B981' },
            { name: 'Red', color: '#EF4444' },
          ].map(c => (
            <button
              key={c.color}
              type="button"
              onClick={() => editor.chain().focus().setColor(c.color).run()}
              className={`w-5 h-5 border border-gray-100 rounded-none cursor-pointer ${
                editor.isActive('textStyle', { color: c.color })
                  ? 'ring-2 ring-black'
                  : ''
              }`}
              style={{ backgroundColor: c.color }}
              title={c.name}
            />
          ))}
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-[9px] font-bold text-gray-400 hover:text-black ml-1 uppercase cursor-pointer"
          >
            Clear
          </button>
        </div>

        <div className="ml-auto flex gap-1">
          <ToolbarButton
            icon={FiRotateCcw}
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          />
          <ToolbarButton
            icon={FiRotateCw}
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          />
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative cursor-text">
        <EditorContent editor={editor} />
        <div className="absolute bottom-2 right-4 pointer-events-none opacity-50">
          <span className="font-mono text-[9px] font-bold text-gray-400 uppercase">
            Characters: {editor.storage.markdown.getMarkdown().length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
