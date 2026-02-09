'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { certificationSchema } from '@/lib/validation/resume-schema';
import type { ResumeCertification } from '@/types/resume';

const certificationListSchema = z.object({
  certifications: z.array(certificationSchema).min(1, 'Add at least one certification'),
});

type CertificationFormData = z.infer<typeof certificationListSchema>;

interface CertificationsFormProps {
  initialData: ResumeCertification[];
  onSave: (data: ResumeCertification[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CertificationsForm({
  initialData,
  onSave,
  onNext,
  onBack,
}: CertificationsFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationListSchema),
    defaultValues: {
      certifications:
        initialData.length > 0
          ? initialData
          : [
              {
                id: crypto.randomUUID(),
                name: '',
                issuer: '',
                date: '',
                url: '',
              },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications',
  });

  const onSubmit = (data: CertificationFormData) => {
    onSave(data.certifications);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {fields.map((field, index) => (
        <div key={field.id} className="p-6 border border-slate-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Certification {index + 1}
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
            {/* Certification Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Certification Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register(`certifications.${index}.name`)}
                placeholder="e.g., AWS Certified Solutions Architect"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.certifications?.[index]?.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.certifications[index]?.name?.message}
                </p>
              )}
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Issuing Organization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register(`certifications.${index}.issuer`)}
                placeholder="e.g., Amazon Web Services"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.certifications?.[index]?.issuer && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.certifications[index]?.issuer?.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                {...register(`certifications.${index}.date`)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.certifications?.[index]?.date && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.certifications[index]?.date?.message}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">Format: YYYY-MM</p>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Credential URL (optional)
              </label>
              <input
                type="text"
                {...register(`certifications.${index}.url`)}
                placeholder="e.g., https://www.credly.com/badges/..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.certifications?.[index]?.url && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.certifications[index]?.url?.message}
                </p>
              )}
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
            name: '',
            issuer: '',
            date: '',
            url: '',
          })
        }
        className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-500 transition font-medium"
      >
        + Add Another Certification
      </button>

      {/* Error Summary */}
      {errors.certifications && (
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
