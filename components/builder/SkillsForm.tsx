'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skillsSchema } from '@/lib/validation/resume-schema';
import type { ResumeSkills } from '@/types/resume';

interface SkillsFormProps {
  initialData: ResumeSkills;
  onSave: (data: ResumeSkills) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SkillsForm({
  initialData,
  onSave,
  onNext,
  onBack,
}: SkillsFormProps) {
  const [technicalInput, setTechnicalInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeSkills>({
    resolver: zodResolver(skillsSchema),
    defaultValues: initialData.technical?.length > 0 || initialData.soft?.length > 0
      ? initialData
      : {
          technical: [],
          soft: [],
        },
  });

  const technical = watch('technical');
  const soft = watch('soft');

  const addTechnicalSkill = () => {
    if (technicalInput.trim()) {
      setValue('technical', [...technical, technicalInput.trim()]);
      setTechnicalInput('');
    }
  };

  const removeTechnicalSkill = (index: number) => {
    setValue(
      'technical',
      technical.filter((_, i) => i !== index)
    );
  };

  const addSoftSkill = () => {
    if (softInput.trim()) {
      setValue('soft', [...soft, softInput.trim()]);
      setSoftInput('');
    }
  };

  const removeSoftSkill = (index: number) => {
    setValue(
      'soft',
      soft.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data: ResumeSkills) => {
    onSave(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Technical Skills */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Technical Skills <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-slate-500 mb-3">
          Add programming languages, tools, frameworks, etc.
        </p>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={technicalInput}
            onChange={(e) => setTechnicalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTechnicalSkill();
              }
            }}
            placeholder="e.g., JavaScript, Python, React"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addTechnicalSkill}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {technical.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeTechnicalSkill(index)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {errors.technical && (
          <p className="text-sm text-red-600">{errors.technical.message}</p>
        )}
      </div>

      {/* Soft Skills */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Soft Skills <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-slate-500 mb-3">
          Add communication, teamwork, problem-solving, etc.
        </p>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={softInput}
            onChange={(e) => setSoftInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSoftSkill();
              }
            }}
            placeholder="e.g., Communication, Teamwork"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addSoftSkill}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
          >
            Add
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {soft.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSoftSkill(index)}
                className="hover:text-green-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {errors.soft && (
          <p className="text-sm text-red-600">{errors.soft.message}</p>
        )}
      </div>

      {/* Suggested Skills */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-900 mb-2">
          💡 Suggested Technical Skills:
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {['JavaScript', 'Python', 'SQL', 'React', 'Git', 'HTML/CSS'].map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => {
                if (!technical.includes(skill)) {
                  setValue('technical', [...technical, skill]);
                }
              }}
              className="px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700 hover:bg-blue-100 transition"
            >
              + {skill}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-blue-900 mb-2">
          💡 Suggested Soft Skills:
        </p>
        <div className="flex flex-wrap gap-2">
          {['Communication', 'Teamwork', 'Problem Solving', 'Time Management', 'Leadership'].map(
            (skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  if (!soft.includes(skill)) {
                    setValue('soft', [...soft, skill]);
                  }
                }}
                className="px-2 py-1 bg-white border border-green-200 rounded text-xs text-green-700 hover:bg-green-100 transition"
              >
                + {skill}
              </button>
            )
          )}
        </div>
      </div>

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
