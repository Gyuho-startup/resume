'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { DEFAULT_SECTION_ORDER, SECTION_LABELS } from '@/lib/section-order';
import type { ResumeSectionKey } from '@/types/resume';

interface SectionReorderPanelProps {
  order: ResumeSectionKey[];
  onChange: (newOrder: ResumeSectionKey[]) => void;
}

const OPTIONAL_SECTIONS: ResumeSectionKey[] = ['summary', 'projects', 'certifications'];

function GripVerticalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function SectionReorderPanel({ order, onChange }: SectionReorderPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const newOrder = Array.from(order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    onChange(newOrder);
  };

  const handleReset = () => {
    onChange([...DEFAULT_SECTION_ORDER]);
  };

  const previewText = order.map((key) => SECTION_LABELS[key]).join(' · ');

  return (
    <div className="w-full">
      {/* Collapsed state: toggle button + order preview */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="section-reorder-panel"
      >
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          Customise section order
        </span>
        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {!isExpanded && (
        <p className="mt-2 text-xs text-slate-400 px-1 truncate" aria-label="Current section order">
          {previewText}
        </p>
      )}

      {/* Expanded state: drag-and-drop list */}
      {isExpanded && (
        <div
          id="section-reorder-panel"
          className="mt-3 bg-white border border-slate-200 rounded-lg p-4"
          role="region"
          aria-label="Drag to reorder CV sections"
        >
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Drag to reorder CV sections
          </h4>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="section-order-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="list-none m-0 p-0"
                  aria-label="CV sections list, drag to reorder"
                >
                  {order.map((sectionKey, index) => (
                    <Draggable key={sectionKey} draggableId={sectionKey} index={index}>
                      {(draggableProvided, snapshot) => (
                        <li
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          className={`
                            bg-white border rounded-lg px-4 py-3 flex items-center gap-3 mb-2
                            transition-shadow select-none
                            ${snapshot.isDragging
                              ? 'shadow-lg border-blue-300'
                              : 'border-slate-200 shadow-sm'
                            }
                          `}
                          style={draggableProvided.draggableProps.style}
                          aria-label={`${SECTION_LABELS[sectionKey]} section${OPTIONAL_SECTIONS.includes(sectionKey) ? ', optional' : ''}`}
                        >
                          {/* Drag handle — min 44px height enforced by py-3 on parent */}
                          <span
                            {...draggableProvided.dragHandleProps}
                            className="text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
                            aria-label="Drag handle"
                          >
                            <GripVerticalIcon />
                          </span>

                          {/* Section label */}
                          <span className="flex-1 text-sm font-medium text-slate-700">
                            {SECTION_LABELS[sectionKey]}
                          </span>

                          {/* Optional badge */}
                          {OPTIONAL_SECTIONS.includes(sectionKey) && (
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                              Optional
                            </span>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            >
              Reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
