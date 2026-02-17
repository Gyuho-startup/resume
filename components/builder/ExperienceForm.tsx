'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { experienceSchema } from '@/lib/validation/resume-schema';
import type { ResumeExperience } from '@/types/resume';
import { useState } from 'react';

const experienceListSchema = z.object({
  experience: z.array(experienceSchema).min(1, 'Add at least one experience entry'),
});

type ExperienceFormData = z.infer<typeof experienceListSchema>;

interface ExperienceFormProps {
  initialData: ResumeExperience[];
  onSave: (data: ResumeExperience[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ExperienceForm({
  initialData,
  onSave,
  onNext,
  onBack,
}: ExperienceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceListSchema),
    defaultValues: {
      experience:
        initialData.length > 0
          ? initialData
          : [
              {
                id: crypto.randomUUID(),
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: 'Present',
                current: false,
                responsibilities: [],
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  // Track responsibilities for each experience entry
  const [responsibilityInputs, setResponsibilityInputs] = useState<{
    [key: number]: string;
  }>({});

  const addResponsibility = (experienceIndex: number) => {
    const input = responsibilityInputs[experienceIndex]?.trim();
    if (input) {
      const current = watch(`experience.${experienceIndex}.responsibilities`);
      setValue(`experience.${experienceIndex}.responsibilities`, [
        ...current,
        input,
      ]);
      setResponsibilityInputs((prev) => ({
        ...prev,
        [experienceIndex]: '',
      }));
    }
  };

  const removeResponsibility = (
    experienceIndex: number,
    responsibilityIndex: number
  ) => {
    const current = watch(`experience.${experienceIndex}.responsibilities`);
    setValue(
      `experience.${experienceIndex}.responsibilities`,
      current.filter((_, i) => i !== responsibilityIndex)
    );
  };

  const onSubmit = (data: ExperienceFormData) => {
    onSave(data.experience);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {fields.map((field, index) => {
        const responsibilities = watch(`experience.${index}.responsibilities`);
        const isCurrent = watch(`experience.${index}.current`);

        return (
          <div
            key={field.id}
            className="p-6 border border-slate-200 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Experience Entry {index + 1}
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

            <div className="grid md:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`experience.${index}.company`)}
                  placeholder="e.g., Microsoft"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.experience?.[index]?.company && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[index]?.company?.message}
                  </p>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`experience.${index}.position`)}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.experience?.[index]?.position && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[index]?.position?.message}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  {...register(`experience.${index}.location`)}
                  placeholder="e.g., London, UK"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  {...register(`experience.${index}.startDate`)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.experience?.[index]?.startDate && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[index]?.startDate?.message}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">Format: YYYY-MM</p>
              </div>

              {/* Current Position Checkbox */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register(`experience.${index}.current`, {
                      onChange: (e) => {
                        if (e.target.checked) {
                          setValue(`experience.${index}.endDate`, 'Present');
                        } else {
                          setValue(`experience.${index}.endDate`, '');
                        }
                      },
                    })}
                    className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    I currently work here
                  </span>
                </label>
              </div>

              {/* End Date (hidden if current) */}
              {!isCurrent && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    {...register(`experience.${index}.endDate`)}
                    placeholder="YYYY-MM or 'Present'"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.experience?.[index]?.endDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.experience[index]?.endDate?.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Leave blank or use "Present"
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Responsibilities <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Add key achievements and responsibilities (bullet points)
                </p>

                {/* Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={responsibilityInputs[index] || ''}
                    onChange={(e) =>
                      setResponsibilityInputs((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addResponsibility(index);
                      }
                    }}
                    placeholder="e.g., Developed RESTful APIs using Node.js and Express"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addResponsibility(index)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>

                {/* List */}
                {responsibilities && responsibilities.length > 0 && (
                  <ul className="space-y-2 mb-2">
                    {responsibilities.map((resp, respIndex) => (
                      <li
                        key={respIndex}
                        className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg"
                      >
                        <span className="flex-1 text-sm text-slate-700">
                          • {resp}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index, respIndex)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {errors.experience?.[index]?.responsibilities && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experience[index]?.responsibilities?.message}
                  </p>
                )}
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
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: 'Present',
            current: false,
            responsibilities: [],
          })
        }
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-500 transition font-medium"
      >
        + Add Another Experience
      </button>

      {/* Error Summary */}
      {errors.experience && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-1">
          <p className="text-sm font-semibold text-red-700">Please fix the following errors:</p>
          {Array.isArray(errors.experience) && errors.experience.map((entryErrors, i) => {
            if (!entryErrors) return null;
            const errs: string[] = [];
            if (entryErrors.company?.message) errs.push(`Entry ${i + 1} — Company: ${entryErrors.company.message}`);
            if (entryErrors.position?.message) errs.push(`Entry ${i + 1} — Position: ${entryErrors.position.message}`);
            if (entryErrors.startDate?.message) errs.push(`Entry ${i + 1} — Start Date: ${entryErrors.startDate.message}`);
            if (entryErrors.endDate?.message) errs.push(`Entry ${i + 1} — End Date: ${entryErrors.endDate.message}`);
            if (entryErrors.responsibilities?.message) errs.push(`Entry ${i + 1} — Responsibilities: ${entryErrors.responsibilities.message}`);
            // Item-level responsibility errors
            if (Array.isArray(entryErrors.responsibilities)) {
              (entryErrors.responsibilities as any[]).forEach((rErr: any, ri: number) => {
                if (rErr?.message) errs.push(`Entry ${i + 1} — Responsibility ${ri + 1}: ${rErr.message}`);
              });
            }
            return errs.map((msg) => (
              <p key={msg} className="text-sm text-red-600">• {msg}</p>
            ));
          })}
          {(errors.experience as any)?.message && (
            <p className="text-sm text-red-600">• {(errors.experience as any).message}</p>
          )}
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
