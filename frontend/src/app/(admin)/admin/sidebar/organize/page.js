'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiSearch,
  FiEdit2,
  FiMove,
  FiLayers,
  FiX,
  FiLayout,
  FiGrid,
  FiCornerDownRight,
  FiFolder,
} from 'react-icons/fi';
import { useSidebarAdmin } from '../../../hooks/useSidebarAdmin';
import { useCategoryAdmin } from '../../../hooks/useCategoryAdmin';
import AuthGuard from '@/app/(shared)/components/AuthGuard';

/**
 * Admin Visual Category Organizer (Advanced)
 * Feature: Multi-level Drag & Drop (Elementor Style).
 * Fix: Explicit event propagation handling to enable nested dropping.
 * Design: Strictly rounded-none, high-contrast industrial feel.
 */
export default function AdminVisualOrganizerPage() {
  return (
    <AuthGuard allowedRoles={['SUPER_ADMIN']}>
      <OrganizerContent />
    </AuthGuard>
  );
}

function OrganizerContent() {
  const { sidebarItems: mainCategories, fetchSidebarItems } = useSidebarAdmin();

  const {
    categories: subCategoriesRes,
    fetchCategories,
    updateCategory,
  } = useCategoryAdmin();

  const [draggedItem, setDraggedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropTargetId, setDropTargetId] = useState(null);

  useEffect(() => {
    fetchSidebarItems();
    fetchCategories({ page_size: 1000 });
  }, [fetchSidebarItems, fetchCategories]);

  const subCategoryList = subCategoriesRes.results || [];

  // --- HIERARCHY BUILDER ---
  const getTreeForMain = mainId => {
    const mainSubs = subCategoryList.filter(
      sc => sc.sidebar_category === mainId,
    );

    const buildNested = (parentId = null) => {
      return mainSubs
        .filter(s => {
          const pid = s.parent?.id || s.parent;
          return parentId === null ? !pid : pid === parentId;
        })
        .map(s => ({
          ...s,
          children: buildNested(s.id),
        }));
    };
    return buildNested();
  };

  // --- DRAG & DROP HANDLERS ---

  const onDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to make the element semi-transparent while dragging
    setTimeout(() => {
      e.target.classList.add('opacity-20');
    }, 0);
  };

  const onDragEnd = e => {
    e.target.classList.remove('opacity-20');
    setDraggedItem(null);
    setDropTargetId(null);
  };

  const onDragOver = (e, targetId) => {
    e.preventDefault();
    e.stopPropagation(); // Crucial for nested targets
    if (dropTargetId !== targetId) {
      setDropTargetId(targetId);
    }
  };

  const handleDrop = async (e, mainId, parentSubId = null) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent parent containers from triggering drop
    setDropTargetId(null);

    if (!draggedItem) return;
    if (draggedItem.id === parentSubId) return; // Cannot nest inside itself

    const formData = new FormData();
    formData.append('name', draggedItem.name);

    // Logic: Assign to Main Category (Method B)
    formData.append('sidebar_category', mainId || '');

    // Logic: Assign to Parent Sub-category (Method A nesting)
    formData.append('parent', parentSubId || '');

    const success = await updateCategory(draggedItem.slug, formData);
    if (success) {
      await fetchCategories({ page_size: 1000 });
      setDraggedItem(null);
    }
  };

  // --- RECURSIVE RENDERER ---
  const SubItem = ({ item, mainId, depth = 0 }) => {
    const isTarget = dropTargetId === `sub-${item.id}`;
    const children = item.children || [];

    return (
      <div className="flex flex-col w-full">
        <div
          draggable
          onDragStart={e => onDragStart(e, item)}
          onDragEnd={onDragEnd}
          onDragOver={e => onDragOver(e, `sub-${item.id}`)}
          onDrop={e => handleDrop(e, mainId, item.id)}
          className={`group/item relative flex items-center justify-between p-3 border border-gray-100 bg-white transition-all mb-1 ${isTarget ? 'border-black bg-gray-50 ring-1 ring-black z-10' : 'hover:border-gray-300'}`}
          style={{ marginLeft: depth > 0 ? `${depth * 20}px` : '0px' }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <FiMove
              className="text-gray-200 group-hover/item:text-black cursor-grab active:cursor-grabbing shrink-0"
              size={12}
            />
            {depth > 0 && (
              <FiCornerDownRight className="text-gray-300 shrink-0" />
            )}
            <span className="text-[10px] font-bold uppercase text-[#1B1B1B] truncate">
              {item.name}
            </span>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              setDraggedItem(item);
              handleDrop(
                { preventDefault: () => {}, stopPropagation: () => {} },
                null,
                null,
              );
            }}
            className="opacity-0 group-hover/item:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer p-1"
          >
            <FiX size={12} />
          </button>
        </div>

        {children.length > 0 && (
          <div className="w-full flex flex-col">
            {children.map(child => (
              <SubItem
                key={child.id}
                item={child}
                mainId={mainId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-[#1B1B1B] tracking-tighter uppercase leading-none">
            Visual Organizer
          </h1>
          <p className="text-[13px] text-[#6B6B5E] mt-3 font-medium">
            Manage your store hierarchy. Drag categories into Main Menus or nest
            them under other categories.
          </p>
        </div>
        <div className="flex bg-gray-50 p-1 border border-gray-100">
          <Link href="/admin/sidebar">
            <button className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-[#8A8A78] hover:text-black transition-all cursor-pointer rounded-none border-none shadow-none bg-transparent">
              <FiLayout className="inline mr-2" /> List View
            </button>
          </Link>
          <button className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest bg-white text-[#1B1B1B] shadow-sm border-none rounded-none">
            <FiGrid className="inline mr-2" /> Visual Organizer
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Left: Unassigned Bucket */}
        <div className="w-full xl:w-96 space-y-6">
          <div className="bg-white border border-gray-100 p-6 sticky top-6 shadow-none">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
              <h3 className="text-xs font-black uppercase tracking-widest">
                Available Subs
              </h3>
              <FiFolder className="text-[#8A8A78]" />
            </div>

            <div className="relative mb-6">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="FIND SUB-CATEGORY..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-100 text-[11px] font-mono outline-none focus:border-black transition-colors rounded-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div
              className="space-y-2 max-h-[65vh] overflow-y-auto admin-scrollbar pr-2 min-h-[100px]"
              onDragOver={e => onDragOver(e, 'bucket')}
              onDrop={e => handleDrop(e, null, null)}
            >
              {subCategoryList
                .filter(sc =>
                  sc.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map(sc => (
                  <div
                    key={sc.id}
                    draggable
                    onDragStart={e => onDragStart(e, sc)}
                    onDragEnd={onDragEnd}
                    className={`p-4 border border-gray-100 bg-white cursor-grab active:cursor-grabbing hover:border-black transition-all group flex items-center justify-between shadow-none rounded-none ${!sc.sidebar_category ? 'border-l-4 border-l-amber-500' : 'opacity-40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FiMove
                        className="text-gray-200 group-hover:text-black"
                        size={12}
                      />
                      <span className="text-[11px] font-bold text-[#1B1B1B] uppercase truncate max-w-[150px]">
                        {sc.name}
                      </span>
                    </div>
                    {!sc.sidebar_category && (
                      <span className="text-[8px] font-mono text-amber-600 font-bold uppercase">
                        UNASSIGNED
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: Main Category Targets */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mainCategories.map(main => {
              const tree = getTreeForMain(main.id);
              const isTarget = dropTargetId === `main-${main.id}`;

              return (
                <div
                  key={main.id}
                  onDragOver={e => onDragOver(e, `main-${main.id}`)}
                  onDrop={e => handleDrop(e, main.id, null)}
                  className={`bg-white border-2 p-8 transition-all min-h-[400px] flex flex-col rounded-none shadow-none ${isTarget ? 'border-black bg-gray-50' : 'border-gray-100'}`}
                >
                  {/* Card Header */}
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-50">
                    <div className="w-14 h-14 relative bg-gray-50 border border-gray-100 p-1 flex items-center justify-center rounded-none shadow-none">
                      <Image
                        src={main.image_url || '/assets/images/placeholder.png'}
                        alt={main.title}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-[#1B1B1B] uppercase tracking-tighter text-lg leading-none mb-2">
                        {main.title}
                      </h4>
                      <span className="font-mono text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                        MAIN MENU ROOT
                      </span>
                    </div>
                  </div>

                  {/* Hierarchical Drop Zone */}
                  <div className="flex-1 space-y-1">
                    {tree.length === 0 ? (
                      <div className="h-full border-2 border-dashed border-gray-50 flex items-center justify-center min-h-[150px]">
                        <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">
                          Drop categories here
                        </span>
                      </div>
                    ) : (
                      tree.map(node => (
                        <SubItem key={node.id} item={node} mainId={main.id} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
