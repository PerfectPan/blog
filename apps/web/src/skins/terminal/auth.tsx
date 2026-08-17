import { Link } from '@tanstack/react-router';
import { unlockErrorLabel } from '../../lib/format.js';
import { useEmailAuth } from '../../lib/use-email-auth.js';

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
      <div className='th-page'>
        <p className='th-comment'># checking session…</p>
      </div>
    );
  }

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>ssh member@perfectpan.org</span>
      </div>
      <p className='th-out th-comment mt-2'>
        # 邮箱密码登录；或者走 GitHub OAuth。
      </p>
      <form className='mt-4' method='post' onSubmit={handleSubmit}>
        <div className='th-field'>
          <label htmlFor='email'>email</label>
          <input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            className='th-input'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className='th-field'>
          <label htmlFor='password'>password</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='current-password'
            className='th-input'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className='mt-5 flex flex-wrap gap-3'>
          <button
            type='submit'
            className='th-btn th-btn-primary'
            disabled={isPending}
          >
            {isPending ? 'signing in…' : 'sign in'}
          </button>
          <button type='button' className='th-btn' onClick={handleGithub}>
            continue with github
          </button>
        </div>
        {error ? (
          <p role='alert' className='th-err'>
            {error}
          </p>
        ) : null}
      </form>
      <p className='th-out mt-4'>
        <span className='th-comment'># 还没有账号？</span>{' '}
        <Link to='/signup'>signup</Link>
      </p>
    </div>
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
      <div className='th-page'>
        <p className='th-comment'># checking session…</p>
      </div>
    );
  }

  return (
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>useradd --join</span>
      </div>
      <p className='th-out th-comment mt-2'>
        # 注册成为 member，可读 member 可见性的文章。
      </p>
      <form className='mt-4' method='post' onSubmit={handleSubmit}>
        <div className='th-field'>
          <label htmlFor='name'>name</label>
          <input
            id='name'
            name='name'
            type='text'
            required
            autoComplete='name'
            className='th-input'
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className='th-field'>
          <label htmlFor='email'>email</label>
          <input
            id='email'
            name='email'
            type='email'
            required
            autoComplete='email'
            className='th-input'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className='th-field'>
          <label htmlFor='password'>password</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            autoComplete='new-password'
            className='th-input'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className='mt-5 flex flex-wrap gap-3'>
          <button
            type='submit'
            className='th-btn th-btn-primary'
            disabled={isPending}
          >
            {isPending ? 'creating…' : 'create account'}
          </button>
          <button type='button' className='th-btn' onClick={handleGithub}>
            continue with github
          </button>
        </div>
        {error ? (
          <p role='alert' className='th-err'>
            {error}
          </p>
        ) : null}
      </form>
    </div>
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
    <div className='th-page'>
      <div className='th-prompt'>
        <span className='th-prompt-u'>guest</span>
        <span className='th-prompt-at'>@</span>
        <span className='th-prompt-h'>perfectpan.org</span>{' '}
        <span className='th-prompt-p'>~ %</span>{' '}
        <span className='th-cmd'>cat posts/{slug}.md</span>
      </div>
      <p className='th-out'>
        <span className='th-nf-big'>
          cat: posts/{slug}.md: Permission denied
        </span>
      </p>
      <p className='th-out th-comment'>
        # 这篇文章是密码保护的。输入单文密码后 24 小时内免密阅读。
      </p>
      <form method='post' className='mt-4'>
        <div className='th-field'>
          <label htmlFor='password'>password for this post</label>
          <input
            id='password'
            name='password'
            type='password'
            required
            className='th-input'
          />
        </div>
        <div className='mt-5 flex flex-wrap items-center gap-3'>
          <button type='submit' className='th-btn th-btn-primary'>
            sudo unlock
          </button>
          <Link to='/blog/$slug' params={{ slug }} className='th-cd'>
            ← 返回文章
          </Link>
        </div>
        {errorLabel ? (
          <p role='alert' className='th-err'>
            {errorLabel}
          </p>
        ) : null}
      </form>
    </div>
  );
}
