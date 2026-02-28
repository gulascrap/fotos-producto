'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Contraseña incorrecta. Intentá de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #1a1030 0%, #0a0a0f 60%)',
      padding: '24px',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(124,107,255,0.15) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(17,17,24,0.8)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(124,107,255,0.2)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #7c6bff, #ff6b9d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
            boxShadow: '0 8px 32px rgba(124,107,255,0.4)',
          }}>
            📸
          </div>
          <h1 style={{ fontSize: '26px', marginBottom: '8px', color: '#f0f0f8' }}>
            Fotos de Producto
          </h1>
          <p style={{ color: '#7878a0', fontSize: '14px' }}>
            Ingresá tu contraseña para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${error ? '#ff4d6d' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px',
                color: '#f0f0f8',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#7c6bff'}
              onBlur={e => e.target.style.borderColor = error ? '#ff4d6d' : 'rgba(255,255,255,0.1)'}
            />
            {error && (
              <p style={{ color: '#ff4d6d', fontSize: '13px', marginTop: '8px' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(124,107,255,0.5)' : 'linear-gradient(135deg, #7c6bff, #9b6bff)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'Syne, sans-serif',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(124,107,255,0.3)',
              opacity: !password ? 0.5 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
