import { Link } from '@tanstack/react-router';
import { unlockErrorLabel } from '../../lib/format.js';
import { useEmailAuth } from '../../lib/use-email-auth.js';
import { btn, btnPrimary, fieldLabel, input, Page, Prompt } from './prompt.js';

export function TerminalLoginPage() {
  const {
    sessionUser,
    isSessionPending,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isPending,
    handleSubmit,
    handleGithub,
  } = useEmailAuth('login');

  if (sessionUser?.id || isSessionPending) {
    return (
      <Page>
        <p className='text-faint'># checking session…</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org'>
        ssh member@perfectpan.org
      </Prompt>
      <p className='my-1 mt-2 text-faint'>
        # 邮箱密码登录；或者走 GitHub OAuth。
      </p>
      <form className='mt-4' method='post' onSubmit={handleSubmit}>
        <div className='my-3.5 max-w-[460px]'>
          <label htmlFor='email' className={fieldLabel}>
            email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            className={input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className='my-3.5 max-w-[460px]'>
          <label htmlFor='password' className={fieldLabel}>
            password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='current-password'
            className={input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className='mt-5 flex flex-wrap gap-3'>
          <button type='submit' className={btnPrimary} disabled={isPending}>
            {isPending ? 'signing in…' : 'sign in'}
          </button>
          <button type='button' className={btn} onClick={handleGithub}>
            continue with github
          </button>
        </div>
        {error ? (
          <p
            role='alert'
            className='my-2.5 text-[13.5px] text-red before:content-["✗_"]'
          >
            {error}
          </p>
        ) : null}
      </form>
      <p className='my-1 mt-4'>
        <span className='text-faint'># 还没有账号？</span>{' '}
        <Link to='/signup'>signup</Link>
      </p>
    </Page>
  );
}

export function TerminalSignupPage() {
  const {
    sessionUser,
    isSessionPending,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    error,
    isPending,
    handleSubmit,
    handleGithub,
  } = useEmailAuth('signup');

  if (sessionUser?.id || isSessionPending) {
    return (
      <Page>
        <p className='text-faint'># checking session…</p>
      </Page>
    );
  }

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org'>
        useradd --join
      </Prompt>
      <p className='my-1 mt-2 text-faint'>
        # 注册成为 member，可读 member 可见性的文章。
      </p>
      <form className='mt-4' method='post' onSubmit={handleSubmit}>
        <div className='my-3.5 max-w-[460px]'>
          <label htmlFor='name' className={fieldLabel}>
            name
          </label>
          <input
            id='name'
            name='name'
            type='text'
            required
            autoComplete='name'
            className={input}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className='my-3.5 max-w-[460px]'>
          <label htmlFor='email' className={fieldLabel}>
            email
          </label>
          <input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            className={input}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className='my-3.5 max-w-[460px]'>
          <label htmlFor='password' className={fieldLabel}>
            password
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='new-password'
            className={input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className='mt-5 flex flex-wrap gap-3'>
          <button type='submit' className={btnPrimary} disabled={isPending}>
            {isPending ? 'creating…' : 'create account'}
          </button>
          <button type='button' className={btn} onClick={handleGithub}>
            continue with github
          </button>
        </div>
        {error ? (
          <p
            role='alert'
            className='my-2.5 text-[13.5px] text-red before:content-["✗_"]'
          >
            {error}
          </p>
        ) : null}
      </form>
    </Page>
  );
}

export function TerminalUnlockPage({
  slug,
  search,
}: {
  slug: string;
  search?: Record<string, string | undefined>;
}) {
  const errorLabel = unlockErrorLabel(search);

  return (
    <Page>
      <Prompt user='guest' host='perfectpan.org'>
        cat posts/{slug}.md
      </Prompt>
      <p className='my-1'>
        <span className='text-red'>
          cat: posts/{slug}.md: Permission denied
        </span>
      </p>
      <p className='my-1 text-faint'>
        # 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。
      </p>
      <form method='post' className='mt-4'>
        <div className='my-3.5 max-w-[460px]'>
          <label htmlFor='password' className={fieldLabel}>
            password for this post
          </label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className={input}
          />
        </div>
        <div className='mt-5 flex flex-wrap items-center gap-3'>
          <button type='submit' className={btnPrimary}>
            sudo unlock
          </button>
          <Link
            to='/blog/$slug'
            params={{ slug }}
            className='text-ink hover:text-amber hover:no-underline'
          >
            ← 返回文章
          </Link>
        </div>
        {errorLabel ? (
          <p
            role='alert'
            className='my-2.5 text-[13.5px] text-red before:content-["✗_"]'
          >
            {errorLabel}
          </p>
        ) : null}
      </form>
    </Page>
  );
}
