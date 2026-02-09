'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalSchema } from '@/lib/validation/resume-schema';
import type { ResumePersonal } from '@/types/resume';

interface PersonalInfoFormProps {
  initialData: ResumePersonal;
  onSave: (data: ResumePersonal) => void;
  onNext: () => void;
}

export default function PersonalInfoForm({
  initialData,
  onSave,
  onNext,
}: PersonalInfoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumePersonal>({
    resolver: zodResolver(personalSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: ResumePersonal) => {
    onSave(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="e.g., Alex Johnson"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder="alex.johnson@email.co.uk"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register('phone')}
            placeholder="+44 20 1234 5678"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('city')}
            placeholder="London, UK"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.city && (
            <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* LinkedIn (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            {...register('linkedin')}
            placeholder="linkedin.com/in/alexjohnson"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.linkedin && (
            <p className="text-sm text-red-600 mt-1">{errors.linkedin.message}</p>
          )}
        </div>

        {/* GitHub (Optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            GitHub
          </label>
          <input
            type="url"
            {...register('github')}
            placeholder="github.com/alexjohnson"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.github && (
            <p className="text-sm text-red-600 mt-1">{errors.github.message}</p>
          )}
        </div>

        {/* Portfolio (Optional) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Portfolio / Personal Website
          </label>
          <input
            type="url"
            {...register('portfolio')}
            placeholder="https://alexjohnson.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.portfolio && (
            <p className="text-sm text-red-600 mt-1">{errors.portfolio.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
