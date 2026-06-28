import { POST_VISIBILITIES } from '@blog/shared';
import { useRouter } from '@tanstack/react-router';
import { useReducer, useState } from 'react';
import {
  type AdminPost,
  deletePostServerFn,
  upsertPostServerFn,
} from '../lib/admin-service.js';
import { MarkdownEditor } from './markdown-editor.js';
import { TagInput } from './tag-input.js';

function todayIso(): string {
  return new Date().toISOString();
}

// Editable form fields, kept as one object driven by a reducer. `tags` is a
// real string[] now (the TagInput manages add/remove); no comma-splitting.
type FormState = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  visibility: AdminPost['visibility'];
  password: string;
  status: AdminPost['status'];
  publishedAt: string;
  body: string;
};

type FormAction = {
  [K in keyof FormState]: { field: K; value: FormState[K] };
}[keyof FormState];

function formReducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.field]: action.value };
}

function toFormState(post: AdminPost): FormState {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    visibility: post.visibility,
    password: post.password,
    status: post.status,
    publishedAt: post.publishedAt.slice(0, 10),
    body: post.body,
  };
}

const EMPTY: AdminPost = {
  slug: '',
  title: '',
  description: '',
  body: '',
  visibility: 'public',
  password: '',
  status: 'published',
  tags: [],
  publishedAt: todayIso(),
};

const card =
  'rounded-lg border border-[#e6e6ea] bg-black/[0.015] p-4 dark:border-slate-700 dark:bg-white/[0.02]';

const inputClass =
  'w-full rounded-md border border-[#d0d0d3] bg-white px-3 py-2 text-sm transition-colors focus:border-black/60 focus:outline-none dark:border-slate-600 dark:bg-wash-dark dark:focus:border-slate-400';

const labelClass = 'mb-1 block text-sm font-semibold';

export function PostEditor({
  initial,
  mode,
}: {
  initial?: AdminPost | null;
  mode: 'new' | 'edit';
}) {
  const router = useRouter();
  const [fields, dispatch] = useReducer(
    formReducer,
    initial ?? EMPTY,
    toFormState,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    dispatch({ field, value } as FormAction);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await upsertPostServerFn({
        data: {
          slug: fields.slug,
          title: fields.title,
          description: fields.description,
          body: fields.body,
          visibility: fields.visibility,
          password: fields.password,
          status: fields.status,
          tags: fields.tags,
          publishedAt: new Date(fields.publishedAt).toISOString(),
        },
      });
      await router.navigate({ to: '/admin' });
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm(`删除文章 “${fields.slug}”？`)) {
      return;
    }
    setSaving(true);
    try {
      await deletePostServerFn({ data: { slug: fields.slug } });
      await router.navigate({ to: '/admin' });
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className='grid gap-5'>
      {error ? (
        <p
          role='alert'
          className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
        >
          {error}
        </p>
      ) : null}

      <section className={`${card} grid gap-4`}>
        <label className='grid'>
          <span className={labelClass}>标题</span>
          <input
            className={inputClass}
            value={fields.title}
            onChange={(event) => setField('title', event.target.value)}
            placeholder='文章标题'
            required
          />
        </label>

        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid'>
            <span className={labelClass}>Slug</span>
            <input
              className={inputClass}
              value={fields.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder='my-post'
              disabled={mode === 'edit'}
              required
            />
          </label>
          <label className='grid'>
            <span className={labelClass}>发布日期</span>
            <input
              type='date'
              className={inputClass}
              value={fields.publishedAt}
              onChange={(event) => setField('publishedAt', event.target.value)}
              required
            />
          </label>
        </div>

        <label className='grid'>
          <span className={labelClass}>摘要</span>
          <textarea
            className={`${inputClass} min-h-[64px] resize-y`}
            value={fields.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder='一句话描述这篇文章'
            rows={2}
          />
        </label>
      </section>

      <section className={`${card} grid gap-4`}>
        <div>
          <span className={labelClass}>标签</span>
          <TagInput
            value={fields.tags}
            onChange={(tags) => setField('tags', tags)}
            placeholder='输入后回车添加，例如：ICPC'
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-3'>
          <label className='grid'>
            <span className={labelClass}>可见性</span>
            <select
              className={inputClass}
              value={fields.visibility}
              onChange={(event) =>
                setField(
                  'visibility',
                  event.target.value as FormState['visibility'],
                )
              }
            >
              {POST_VISIBILITIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className='grid'>
            <span className={labelClass}>状态</span>
            <select
              className={inputClass}
              value={fields.status}
              onChange={(event) =>
                setField('status', event.target.value as FormState['status'])
              }
            >
              <option value='published'>published</option>
              <option value='draft'>draft</option>
            </select>
          </label>
          {fields.visibility === 'password' ? (
            <label className='grid'>
              <span className={labelClass}>密码</span>
              <input
                className={inputClass}
                value={fields.password}
                onChange={(event) => setField('password', event.target.value)}
                placeholder='访问密码'
              />
            </label>
          ) : null}
        </div>
      </section>

      <section className='grid gap-2'>
        <span className={labelClass}>正文（Markdown）</span>
        <MarkdownEditor
          value={fields.body}
          onChange={(body) => setField('body', body)}
        />
      </section>

      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={saving}
          className='rounded-md bg-black px-5 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-neutral-900'
        >
          {saving ? '保存中…' : '保存'}
        </button>
        {mode === 'edit' ? (
          <button
            type='button'
            onClick={onDelete}
            disabled={saving}
            className='rounded-md border border-red-300 px-4 py-2 text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950'
          >
            删除
          </button>
        ) : null}
      </div>
    </form>
  );
}
