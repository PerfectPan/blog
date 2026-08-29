'use client';

import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useTransition } from 'react';
import { authClient } from './auth-client.js';

/**
 * Shared email/password auth flow for the login and signup pages, across both
 * skins. Each skin keeps its own markup; the session gate, form state,
 * submit, and GitHub OAuth handler live here so behavior changes once.
 */
export function useEmailAuth(mode: 'login' | 'signup') {
  const navigate = useNavigate();
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sessionUser = sessionData?.user ?? null;

  useEffect(() => {
    if (sessionUser?.id) {
      navigate({ to: '/blog', replace: true });
    }
  }, [navigate, sessionUser?.id]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result =
        mode === 'login'
          ? await authClient.signIn.email({
              email,
              password,
              callbackURL: '/blog',
            })
          : await authClient.signUp.email({
              email,
              password,
              name,
              callbackURL: '/blog',
            });

      if (result.error) {
        setError(
          result.error.message ?? (mode === 'login' ? '登录失败' : '注册失败'),
        );
        return;
      }

      navigate({ to: '/blog' });
    });
  };

  const handleGithub = async () => {
    setError(null);
    const result = await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/blog',
    });
    if (result.error) {
      setError(result.error.message ?? 'GitHub 登录失败');
    }
  };

  return {
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
  };
}
