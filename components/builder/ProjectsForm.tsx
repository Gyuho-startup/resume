'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectSchema } from '@/lib/validation/resume-schema';
import type { ResumeProject } from '@/types/resume';
import { useState } from 'react';

const projectListSchema = z.object({
  projects: z.array(projectSchema).min(1, 'Add at least one project'),
});

type ProjectFormData = z.infer<typeof projectListSchema>;

interface ProjectsFormProps {
  initialData: ResumeProject[];
  onSave: (data: ResumeProject[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ProjectsForm({
  initialData,
  onSave,
  onNext,
  onBack,
}: ProjectsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectListSchema),
    defaultValues: {
      projects:
        initialData.length > 0
          ? initialData
          : [
              {
                id: crypto.randomUUID(),
                name: '',
                description: '',
                technologies: [],
                url: '',
                startDate: '',
                endDate: '',
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  // Track technology inputs for each project
  const [techInputs, setTechInputs] = useState<{ [key: number]: string }>({});

  const addTechnology = (projectIndex: number) => {
    const input = techInputs[projectIndex]?.trim();
    if (input) {
      const current = watch(`projects.${projectIndex}.technologies`);
      setValue(`projects.${projectIndex}.technologies`, [...current, input]);
      setTechInputs((prev) => ({
        ...prev,
        [projectIndex]: '',
      }));
    }
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const current = watch(`projects.${projectIndex}.technologies`);
    setValue(
      `projects.${projectIndex}.technologies`,
      current.filter((_, i) => i !== techIndex)
    );
  };

  const onSubmit = (data: ProjectFormData) => {
    onSave(data.projects);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {fields.map((field, index) => {
        const technologies = watch(`projects.${index}.technologies`);

        return (
          <div
            key={field.id}
            className="p-6 border border-slate-200 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Project {index + 1}
              </h3>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`projects.${index}.name`)}
                  placeholder="e.g., E-commerce Platform"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.projects?.[index]?.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.projects[index]?.name?.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register(`projects.${index}.description`)}
                  rows={4}
                  placeholder="Describe what the project does, your role, and the impact. E.g., Built a full-stack e-commerce platform with product catalog, shopping cart, and payment integration. Implemented responsive UI with React and backend APIs with Node.js."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.projects?.[index]?.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.projects[index]?.description?.message}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Minimum 20 characters
                </p>
              </div>

              {/* Technologies */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Technologies <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Add technologies used (e.g., React, Node.js, PostgreSQL)
                </p>

                {/* Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={techInputs[index] || ''}
                    onChange={(e) =>
                      setTechInputs((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnology(index);
                      }
                    }}
                    placeholder="e.g., React, TypeScript"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTechnology(index)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTechnology(index, techIndex)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {errors.projects?.[index]?.technologies && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.projects[index]?.technologies?.message}
                  </p>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project URL (optional)
                </label>
                <input
                  type="text"
                  {...register(`projects.${index}.url`)}
                  placeholder="e.g., https://github.com/username/project"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.projects?.[index]?.url && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.projects[index]?.url?.message}
                  </p>
                )}
              </div>

              {/* Dates (Optional) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date (optional)
                  </label>
                  <input
                    type="month"
                    {...register(`projects.${index}.startDate`)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.projects?.[index]?.startDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.projects[index]?.startDate?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date (optional)
                  </label>
                  <input
                    type="month"
                    {...register(`projects.${index}.endDate`)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.projects?.[index]?.endDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.projects[index]?.endDate?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Entry Button */}
      <button
        type="button"
        onClick={() =>
          append({
            id: crypto.randomUUID(),
            name: '',
            description: '',
            technologies: [],
            url: '',
            startDate: '',
            endDate: '',
          })
        }
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-500 transition font-medium"
      >
        + Add Another Project
      </button>

      {/* Error Summary */}
      {errors.projects && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            Please fix the errors above before continuing.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              onSave([]);
              onNext();
            }}
            className="px-6 py-2 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 transition"
          >
            Skip for now
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </form>
  );
}
