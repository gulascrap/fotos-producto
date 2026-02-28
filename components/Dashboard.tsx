'use client';
import { useState, useRef, useCallback } from 'react';
import { STYLES, Style } from '@/lib/prompts';
import { useRouter } from 'next/navigation';

type StyleKey = keyof typeof STYLES;

interface Result {
  style: Style;
  styleLabel: string;
  driveLink: string;
  downloadLink: string;
  index: number;
  error?: string;
}

interface GenerateResponse {
  success: boolean;
  folderLink: string;
  results: Result[];
}

export default function Dashboard({ styles }: { styles: typeof STYLES }) {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<StyleKey[]>(['blanco']);
  const [quantity, setQuantity] = useState(1);
  const [productName, setProductName] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor subí una imagen (JPG, PNG, WebP)');
      return;
    }
    setImage(file);
    setError('');
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const toggleStyle = (style: StyleKey) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.length > 1 ? prev.filter(s => s !== style) : prev
        : [...prev, style]
    );
  };

  const totalImages = selectedStyles.length * quantity;

  async function handleGenerate() {
    if (!image || !productName.trim()) {
      setError('Completá el nombre del producto y subí una imagen');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (totalImages * 15)), 90));
    }, 1000);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('styles', JSON.stringify(selectedStyles));
    formData.append('quantity', quantity.toString());
    formData.append('productName', productName);
    formData.append('context', context);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al generar las imágenes');
      }

      const data: GenerateResponse = await res.json();
      setResults(data);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  }

  const successCount = results?.results.filter(r => !r.error).length || 0;
  const errorCount = results?.results.filter(r => r.error).length || 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(17,17,24,0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7c6bff, #ff6b9d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>📸</div>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0 }}>Fotos de Producto Pro</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Potenciado por Gemini AI</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '10px', color: 'var(--text-muted)', padding: '8px 16px',
            fontSize: '13px', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.borderColor = 'var(--error)';
            (e.target as HTMLButtonElement).style.color = 'var(--error)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.target as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            background: 'linear-gradient(135deg, #f0f0f8 30%, #7c6bff 70%, #ff6b9d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            lineHeight: 1.1,
          }}>
            Fotos Profesionales<br />con IA
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
            Subí la foto de tu producto y generá automáticamente fotos profesionales listas para tu tienda online.
          </p>
        </div>

        {/* Upload Zone */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            1. Foto del producto
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent)' : imagePreview ? 'rgba(124,107,255,0.4)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isDragging ? 'rgba(124,107,255,0.05)' : 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexDirection: imagePreview ? 'row' : 'column',
            }}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}
                />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>{image?.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {image ? (image.size / 1024 / 1024).toFixed(2) : 0} MB
                  </p>
                  <p style={{ color: 'var(--accent)', fontSize: '13px', marginTop: '8px' }}>
                    Clic para cambiar la imagen
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(124,107,255,0.2), rgba(255,107,157,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                }}>📷</div>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>Arrastrá o hacé clic para subir</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>JPG, PNG, WebP</p>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </section>

        {/* Product Name */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            2. Nombre del producto
          </label>
          <input
            type="text"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            placeholder="Ej: Organizador de escritorio bambú"
            style={{
              width: '100%', padding: '14px 18px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text)', fontSize: '15px',
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </section>

        {/* Context (optional) */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            3. Contexto adicional <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-muted)', fontSize: '12px' }}>(opcional)</span>
          </label>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Describí el producto para que la IA genere mejores fotos
          </p>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Ej: Es un organizador de madera natural, minimalista, para escritorios modernos..."
            rows={3}
            style={{
              width: '100%', padding: '14px 18px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text)', fontSize: '15px',
              outline: 'none', resize: 'vertical', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </section>

        {/* Style Selection */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            4. Estilos de foto
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            {(Object.entries(styles) as [StyleKey, typeof STYLES[StyleKey]][]).map(([key, style]) => {
              const selected = selectedStyles.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleStyle(key)}
                  style={{
                    padding: '18px',
                    background: selected ? 'rgba(124,107,255,0.15)' : 'var(--surface)',
                    border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '14px',
                    color: 'var(--text)',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{style.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{style.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{style.description}</div>
                  {selected && (
                    <div style={{
                      marginTop: '10px', fontSize: '11px', fontWeight: 700,
                      color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>✓ Seleccionado</div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Quantity */}
        <section style={{ marginBottom: '40px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            5. Variaciones por estilo
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[1, 2, 3].map(n => (
              <button
                key={n}
                onClick={() => setQuantity(n)}
                style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: quantity === n ? 'rgba(124,107,255,0.15)' : 'var(--surface)',
                  border: `1.5px solid ${quantity === n ? 'var(--accent)' : 'var(--border)'}`,
                  color: quantity === n ? 'var(--accent)' : 'var(--text)',
                  fontSize: '20px', fontWeight: 700,
                  fontFamily: 'Syne, sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                {n}
              </button>
            ))}
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              → <strong style={{ color: 'var(--text)' }}>{totalImages} foto{totalImages !== 1 ? 's' : ''}</strong> en total
              <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                ({selectedStyles.length} estilo{selectedStyles.length !== 1 ? 's' : ''} × {quantity})
              </span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)',
            borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
            color: 'var(--error)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !image || !productName.trim()}
          style={{
            width: '100%', padding: '18px',
            background: loading || !image || !productName.trim()
              ? 'rgba(124,107,255,0.3)'
              : 'linear-gradient(135deg, #7c6bff 0%, #a56bff 50%, #ff6b9d 100%)',
            border: 'none', borderRadius: '16px',
            color: 'white', fontSize: '18px', fontWeight: 700,
            fontFamily: 'Syne, sans-serif',
            transition: 'all 0.3s',
            boxShadow: !loading && image && productName.trim() ? '0 8px 32px rgba(124,107,255,0.4)' : 'none',
            cursor: loading || !image || !productName.trim() ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.02em',
          }}
        >
          {loading ? `Generando... ⚡` : `Generar ${totalImages} foto${totalImages !== 1 ? 's' : ''} profesional${totalImages !== 1 ? 'es' : ''} →`}
        </button>

        {/* Progress Bar */}
        {loading && (
          <div style={{ marginTop: '20px' }}>
            <div style={{
              height: '4px', background: 'var(--surface2)', borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c6bff, #ff6b9d)',
                borderRadius: '2px', transition: 'width 0.5s ease',
              }} />
            </div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
              Procesando {Math.round(progress)}%... Esto puede tardar {totalImages * 20}-{totalImages * 40} segundos
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <section style={{ marginTop: '56px' }}>
            <div style={{
              background: 'rgba(77,255,180,0.08)', border: '1px solid rgba(77,255,180,0.2)',
              borderRadius: '16px', padding: '20px 24px', marginBottom: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            }}>
              <div>
                <h3 style={{ fontSize: '20px', color: 'var(--success)', margin: 0 }}>
                  ✅ {successCount} foto{successCount !== 1 ? 's' : ''} generada{successCount !== 1 ? 's' : ''}
                  {errorCount > 0 && <span style={{ color: 'var(--error)' }}> · {errorCount} error{errorCount !== 1 ? 'es' : ''}</span>}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>
                  Guardadas en tu Google Drive
                </p>
              </div>
              <a
                href={results.folderLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(77,255,180,0.15)',
                  border: '1px solid rgba(77,255,180,0.3)',
                  borderRadius: '10px',
                  color: 'var(--success)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                📁 Abrir carpeta en Drive
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {results.results.map((result, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface)',
                    border: `1px solid ${result.error ? 'rgba(255,77,109,0.3)' : 'var(--border)'}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{
                    padding: '16px 16px 12px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {styles[result.style as StyleKey]?.emoji || '📸'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {styles[result.style as StyleKey]?.label || result.style}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        Variación {result.index}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    {result.error ? (
                      <p style={{ color: 'var(--error)', fontSize: '13px' }}>
                        Error: {result.error}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <a
                          href={result.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '10px', background: 'rgba(124,107,255,0.1)',
                            border: '1px solid rgba(124,107,255,0.2)',
                            borderRadius: '10px', color: 'var(--accent)',
                            textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                          }}
                        >
                          👁 Ver en Drive
                        </a>
                        <a
                          href={result.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '10px', background: 'rgba(107,255,218,0.08)',
                            border: '1px solid rgba(107,255,218,0.2)',
                            borderRadius: '10px', color: 'var(--accent3)',
                            textDecoration: 'none', fontSize: '13px', fontWeight: 600,
                          }}
                        >
                          ⬇ Descargar
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Generate more */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => { setResults(null); setImage(null); setImagePreview(''); setProductName(''); setContext(''); }}
                style={{
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: '12px', color: 'var(--text-muted)',
                  padding: '12px 24px', fontSize: '14px',
                }}
              >
                Generar otro producto
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
