'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiType,
  FiCornerUpLeft,
  FiCornerUpRight,
} from 'react-icons/fi';

/**
 * RichTextEditor Component
 * A professional WYSIWYG editor that outputs clean Markdown (README format).
 * Fix: Added content reactivity using useEffect to handle asynchronous data loading in Edit Mode.
 * Design: Sharp Industrial (rounded-none, border-2, high contrast).
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Start typing medicine details...',
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Markdown.configure({
        html: false, // Maintain pure markdown output
        tightLists: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[250px] p-5 font-sans text-black uppercase',
      },
    },
    onUpdate: ({ editor }) => {
      // Get content as Markdown string and pass to parent hook/state
      const markdown = editor.storage.markdown.getMarkdown();
      if (onChange) {
        onChange(markdown);
      }
    },
  });

  /**
   * FIX: Handle asynchronous value updates.
   * When data is fetched from the API and 'value' changes,
   * we must manually tell the editor to update its content.
   */
  useEffect(() => {
    if (
      editor &&
      value !== undefined &&
      value !== editor.storage.markdown.getMarkdown()
    ) {
      editor.commands.setContent(value, false); // false = don't emit update event to avoid loops
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, isActive, icon: Icon, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 border border-gray-100 transition-all cursor-pointer flex items-center justify-center rounded-none ${
        isActive
          ? 'bg-black text-white'
          : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
      title={title}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="w-full border-2 border-gray-100 bg-white group focus-within:border-black transition-all rounded-none">
      {/* Professional Toolbar */}
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

        <div className="w-px h-8 bg-gray-200 mx-1 self-center" />

        <ToolbarButton
          icon={FiType}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading"
        />
        <ToolbarButton
          icon={FiList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        />

        <div className="w-px h-8 bg-gray-200 mx-1 self-center" />

        <ToolbarButton
          icon={FiCornerUpLeft}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        />
        <ToolbarButton
          icon={FiCornerUpRight}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        />

        <div className="ml-auto pr-4 flex items-center">
          <span className="font-mono text-[9px] font-bold text-gray-300 uppercase tracking-widest">
            ENGINE: TIPTAP_MARKDOWN
          </span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative cursor-text">
        <EditorContent editor={editor} />

        <div className="absolute bottom-2 right-4 pointer-events-none">
          <span className="font-mono text-[9px] font-bold text-gray-300 uppercase">
            Characters: {editor.storage.markdown.getMarkdown().length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
