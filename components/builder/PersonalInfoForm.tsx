'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalSchema } from '@/lib/validation/resume-schema';
import type { ResumePersonal } from '@/types/resume';

const SUMMARY_MAX_CHARS = 500;

interface PersonalInfoFormProps {
  initialData: ResumePersonal;
  summary?: string;
  onSave: (data: ResumePersonal) => void;
  onSummarySave?: (summary: string) => void;
  onNext: () => void;
}

export default function PersonalInfoForm({
  initialData,
  summary,
  onSave,
  onSummarySave,
  onNext,
}: PersonalInfoFormProps) {
  const [summaryText, setSummaryText] = useState<string>(summary ?? '');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResumePersonal>({
    resolver: zodResolver(personalSchema),
    defaultValues: initialData,
  });

  // 입력 즉시 Live Preview에 반영
  const watchedValues = watch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onSave(watchedValues);
  // JSON.stringify로 값 변경 시에만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  // Summary 변경 즉시 Live Preview에 반영
  useEffect(() => {
    if (onSummarySave) {
      onSummarySave(summaryText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryText]);

  const onSubmit = (_data: ResumePersonal) => {
    onNext();
  };

  const charsUsed = summaryText.length;

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

        {/* Professional Summary (Optional) */}
        <div className="md:col-span-2">
          <label
            htmlFor="professional-summary"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Professional Summary (Optional)
          </label>
          <textarea
            id="professional-summary"
            value={summaryText}
            onChange={(e) => {
              if (e.target.value.length <= SUMMARY_MAX_CHARS) {
                setSummaryText(e.target.value);
              }
            }}
            rows={4}
            placeholder="e.g., Recent Computer Science graduate from the University of Manchester with strong skills in Python and data analysis. Seeking a software engineering role where I can apply my academic knowledge and internship experience."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="flex items-start justify-between mt-1 gap-4">
            <p className="text-xs text-slate-500">
              2-3 sentences summarising your background and what you&apos;re looking for. Appears at the top of your CV.
            </p>
            <p
              className={`text-xs whitespace-nowrap flex-shrink-0 ${
                charsUsed >= SUMMARY_MAX_CHARS - 50 ? 'text-amber-600' : 'text-slate-400'
              }`}
            >
              {charsUsed} / {SUMMARY_MAX_CHARS}
            </p>
          </div>
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
