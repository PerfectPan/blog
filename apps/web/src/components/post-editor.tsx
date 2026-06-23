import { POST_VISIBILITIES } from '@blog/shared';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import {
  type AdminPost,
  deletePostServerFn,
  upsertPostServerFn,
} from '../lib/admin-service.js';

function todayIso(): string {
  // Avoid Date.now()-style nondeterminism concerns: a plain date string is fine.
  return new Date().toISOString();
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
  const start = initial ?? EMPTY;
  const [slug, setSlug] = useState(start.slug);
  const [title, setTitle] = useState(start.title);
  const [description, setDescription] = useState(start.description);
  const [tags, setTags] = useState(start.tags.join(', '));
  const [visibility, setVisibility] = useState(start.visibility);
  const [password, setPassword] = useState(start.password);
  const [status, setStatus] = useState(start.status);
  const [publishedAt, setPublishedAt] = useState(
    start.publishedAt.slice(0, 10),
  );
  const [body, setBody] = useState(start.body);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await upsertPostServerFn({
        data: {
          slug,
          title,
          description,
          body,
          visibility,
          password,
          status,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          publishedAt: new Date(publishedAt).toISOString(),
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
    if (!confirm(`删除文章 “${slug}”？`)) {
      return;
    }
    setSaving(true);
    try {
      await deletePostServerFn({ data: { slug } });
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
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>

      <label className='grid gap-1'>
        <span className='font-semibold'>Slug</span>
        <input
          className={inputClass}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          placeholder='my-post'
          disabled={mode === 'edit'}
          required
        />
      </label>

      <label className='grid gap-1'>
        <span className='font-semibold'>Description</span>
        <input
          className={inputClass}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='grid gap-1'>
          <span className='font-semibold'>Tags（逗号分隔）</span>
          <input
            className={inputClass}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </label>
        <label className='grid gap-1'>
          <span className='font-semibold'>Published date</span>
          <input
            type='date'
            className={inputClass}
            value={publishedAt}
            onChange={(event) => setPublishedAt(event.target.value)}
            required
          />
        </label>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <label className='grid gap-1'>
          <span className='font-semibold'>Visibility</span>
          <select
            className={inputClass}
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as typeof visibility)
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
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value='published'>published</option>
            <option value='draft'>draft</option>
          </select>
        </label>
        {visibility === 'password' ? (
          <label className='grid gap-1'>
            <span className='font-semibold'>Password</span>
            <input
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        ) : null}
      </div>

      <label className='grid gap-1'>
        <span className='font-semibold'>Body（Markdown）</span>
        <textarea
          className={`${inputClass} min-h-[360px] font-mono text-sm`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
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
