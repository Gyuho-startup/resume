'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { educationSchema } from '@/lib/validation/resume-schema';
import type { ResumeEducation } from '@/types/resume';

const educationListSchema = z.object({
  education: z.array(educationSchema).min(1, 'Add at least one education entry'),
});

type EducationFormData = z.infer<typeof educationListSchema>;

interface EducationFormProps {
  initialData: ResumeEducation[];
  onSave: (data: ResumeEducation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function EducationForm({
  initialData,
  onSave,
  onNext,
  onBack,
}: EducationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationListSchema),
    defaultValues: {
      education:
        initialData.length > 0
          ? initialData
          : [
              {
                id: crypto.randomUUID(),
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                grade: '',
                achievements: [],
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const onSubmit = (data: EducationFormData) => {
    onSave(data.education);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {fields.map((field, index) => (
        <div key={field.id} className="p-6 border border-slate-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Education Entry {index + 1}
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
            {/* Institution */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Institution / University <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register(`education.${index}.institution`)}
                placeholder="e.g., University of Manchester"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.education?.[index]?.institution && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.education[index]?.institution?.message}
                </p>
              )}
            </div>

            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register(`education.${index}.degree`)}
                placeholder="e.g., BSc Computer Science"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.education?.[index]?.degree && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.education[index]?.degree?.message}
                </p>
              )}
            </div>

            {/* Field of Study */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Field of Study
              </label>
              <input
                type="text"
                {...register(`education.${index}.field`)}
                placeholder="e.g., Software Engineering"
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
                {...register(`education.${index}.startDate`)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.education?.[index]?.startDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.education[index]?.startDate?.message}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">Format: YYYY-MM</p>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="text"
                {...register(`education.${index}.endDate`)}
                placeholder="YYYY-MM or 'Present'"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.education?.[index]?.endDate && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.education[index]?.endDate?.message}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">Leave blank or use "Present"</p>
            </div>

            {/* Grade */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Grade / Classification
              </label>
              <input
                type="text"
                {...register(`education.${index}.grade`)}
                placeholder="e.g., First Class Honours, 2:1"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Entry Button */}
      <button
        type="button"
        onClick={() =>
          append({
            id: crypto.randomUUID(),
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            grade: '',
            achievements: [],
          })
        }
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-500 transition font-medium"
      >
        + Add Another Education
      </button>

      {/* Error Summary */}
      {errors.education && (
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
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Save & Continue
        </button>
      </div>
    </form>
  );
}
