import { POST_VISIBILITIES } from '@blog/shared';
import { useRouter } from '@tanstack/react-router';
import { useReducer, useState } from 'react';
import {
  type AdminPost,
  deletePostServerFn,
  upsertPostServerFn,
} from '../lib/admin-service.js';

function todayIso(): string {
  // Avoid Date.now()-style nondeterminism concerns: a plain date string is fine.
  return new Date().toISOString();
}

// The editable form fields, kept as one object driven by a reducer instead of
// a dozen separate useState hooks. `tags` is the raw comma-separated string;
// it's split into an array on submit.
type FormState = {
  slug: string;
  title: string;
  description: string;
  tags: string;
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
    tags: post.tags.join(', '),
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

const inputClass =
  'w-full rounded-md border border-[#d0d0d3] px-3 py-2 dark:border-slate-700 dark:bg-wash-dark';

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

  // Typed field setter: `setField('title', value)` stays exhaustive over keys.
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
          tags: fields.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
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
    <form onSubmit={onSubmit} className='grid gap-4'>
      {error ? (
        <p role='alert' className='text-sm text-red-700 dark:text-red-300'>
          {error}
        </p>
      ) : null}

      <label className='grid gap-1'>
        <span className='font-semibold'>Title</span>
        <input
          className={inputClass}
          value={fields.title}
          onChange={(event) => setField('title', event.target.value)}
          required
        />
      </label>

      <label className='grid gap-1'>
        <span className='font-semibold'>Slug</span>
        <input
          className={inputClass}
          value={fields.slug}
          onChange={(event) => setField('slug', event.target.value)}
          placeholder='my-post'
          disabled={mode === 'edit'}
          required
        />
      </label>

      <label className='grid gap-1'>
        <span className='font-semibold'>Description</span>
        <input
          className={inputClass}
          value={fields.description}
          onChange={(event) => setField('description', event.target.value)}
        />
      </label>

      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='grid gap-1'>
          <span className='font-semibold'>Tags（逗号分隔）</span>
          <input
            className={inputClass}
            value={fields.tags}
            onChange={(event) => setField('tags', event.target.value)}
          />
        </label>
        <label className='grid gap-1'>
          <span className='font-semibold'>Published date</span>
          <input
            type='date'
            className={inputClass}
            value={fields.publishedAt}
            onChange={(event) => setField('publishedAt', event.target.value)}
            required
          />
        </label>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <label className='grid gap-1'>
          <span className='font-semibold'>Visibility</span>
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
        <label className='grid gap-1'>
          <span className='font-semibold'>Status</span>
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
          <label className='grid gap-1'>
            <span className='font-semibold'>Password</span>
            <input
              className={inputClass}
              value={fields.password}
              onChange={(event) => setField('password', event.target.value)}
            />
          </label>
        ) : null}
      </div>

      <label className='grid gap-1'>
        <span className='font-semibold'>Body（Markdown）</span>
        <textarea
          className={`${inputClass} min-h-[360px] font-mono text-sm`}
          value={fields.body}
          onChange={(event) => setField('body', event.target.value)}
        />
      </label>

      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={saving}
          className='rounded-md bg-black px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-neutral-900'
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
