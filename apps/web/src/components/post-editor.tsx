import { POST_VISIBILITIES } from '@blog/shared';
import { useRouter } from '@tanstack/react-router';
import { useReducer, useState } from 'react';
import {
  type AdminPost,
  deletePostServerFn,
  upsertPostServerFn,
} from '../lib/admin-service.js';
import { ConfirmDialog } from './confirm-dialog.js';
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

export function PostEditor({
  initial,
  mode,
  allTags = [],
}: {
  initial?: AdminPost | null;
  mode: 'new' | 'edit';
  allTags?: string[];
}) {
  const router = useRouter();
  const [fields, dispatch] = useReducer(
    formReducer,
    initial ?? EMPTY,
    toFormState,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
        <p role='alert' className='th-err'>
          {error}
        </p>
      ) : null}

      <section className='th-panel grid gap-4'>
        <label className='grid'>
          <span className='th-flabel'>标题</span>
          <input
            className='th-input'
            value={fields.title}
            onChange={(event) => setField('title', event.target.value)}
            placeholder='文章标题'
            required
          />
        </label>

        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='grid'>
            <span className='th-flabel'>Slug</span>
            <input
              className='th-input'
              value={fields.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder='my-post'
              disabled={mode === 'edit'}
              required
            />
          </label>
          <label className='grid'>
            <span className='th-flabel'>发布日期</span>
            <input
              type='date'
              className='th-input'
              value={fields.publishedAt}
              onChange={(event) => setField('publishedAt', event.target.value)}
              required
            />
          </label>
        </div>

        <label className='grid'>
          <span className='th-flabel'>摘要</span>
          <textarea
            className='th-input min-h-[64px] resize-y'
            value={fields.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder='一句话描述这篇文章'
            rows={2}
          />
        </label>
      </section>

      <section className='th-panel grid gap-4'>
        <div className='grid gap-2'>
          <span className='th-flabel'>标签</span>
          <TagInput
            value={fields.tags}
            onChange={(tags) => setField('tags', tags)}
            placeholder='输入后回车添加，或点击下方已有标签'
            suggestions={allTags}
          />
        </div>

        <div className='grid gap-4 sm:grid-cols-3'>
          <label className='grid'>
            <span className='th-flabel'>可见性</span>
            <select
              className='th-input'
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
            <span className='th-flabel'>状态</span>
            <select
              className='th-input'
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
              <span className='th-flabel'>密码</span>
              <input
                className='th-input'
                value={fields.password}
                onChange={(event) => setField('password', event.target.value)}
                placeholder='访问密码'
              />
            </label>
          ) : null}
        </div>
      </section>

      <section className='grid gap-2'>
        <span className='th-flabel'>正文（Markdown）</span>
        <MarkdownEditor
          value={fields.body}
          onChange={(body) => setField('body', body)}
        />
      </section>

      <div className='flex items-center gap-3'>
        <button
          type='submit'
          disabled={saving}
          className='th-btn th-btn-primary'
        >
          {saving ? '保存中…' : '保存'}
        </button>
        {mode === 'edit' ? (
          <button
            type='button'
            onClick={() => {
              setConfirmDelete(true);
            }}
            disabled={saving}
            className='th-btn th-btn-danger'
          >
            删除
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        command='rm post'
        description={`确定删除文章 “${fields.slug}”？此操作不可恢复。`}
        confirmLabel='delete'
        onConfirm={() => {
          setConfirmDelete(false);
          onDelete();
        }}
      />
    </form>
  );
}
