'use client';
import { useState, useRef, useCallback } from 'react';
import { STYLES, Style } from '@/lib/prompts';
import { useRouter } from 'next/navigation';

type StyleKey = keyof typeof STYLES;

interface Result {
  style: Style;
  imageBase64: string;
  index: number;
  fileName: string;
  error?: string;
  status: 'pending' | 'loading' | 'done' | 'error';
}

export default function Dashboard({ styles }: { styles: typeof STYLES }) {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<StyleKey[]>(['blanco']);
  const [quantity, setQuantity] = useState(1);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFiles = (files: FileList) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) { setError('Solo se aceptan imágenes'); return; }
    setImages(prev => [...prev, ...valid]);
    setError('');
    valid.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => setImagePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }, []);

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleStyle = (style: StyleKey) => {
    setSelectedStyles(prev => prev.includes(style) ? prev.length > 1 ? prev.filter(s => s !== style) : prev : [...prev, style]);
  };

  const totalImages = images.length * selectedStyles.length * quantity;

  function downloadImage(base64: string, fileName: string) {
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64}`;
    link.download = fileName;
    link.click();
  }

  function downloadAll() {
    results.filter(r => !r.error && r.imageBase64).forEach(r => downloadImage(r.imageBase64, r.fileName));
  }

  async function generateOne(image: File, style: StyleKey, index: number): Promise<Result> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('style', style);
    formData.append('index', index.toString());
    formData.append('productName', productName || image.name.replace(/\.[^.]+$/, ''));
    formData.append('context', '');

    try {
      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || data.error) return { style: style as Style, imageBase64: '', index, fileName: '', status: 'error', error: data.error || 'Error' };
      return { style: style as Style, imageBase64: data.imageBase64, index, fileName: data.fileName, status: 'done' };
    } catch (err) {
      return { style: style as Style, imageBase64: '', index, fileName: '', status: 'error', error: 'Error de red' };
    }
  }

  async function handleGenerate() {
    if (images.length === 0) { setError('Subí al menos una imagen'); return; }
    setLoading(true); setError(''); setCompleted(0);

    const tasks: { image: File; style: StyleKey; index: number }[] = [];
    for (const image of images) {
      for (const style of selectedStyles) {
        for (let i = 1; i <= quantity; i++) {
          tasks.push({ image, style, index: i });
        }
      }
    }

    setTotal(tasks.length);
    const initialResults: Result[] = tasks.map(t => ({ style: t.style as Style, imageBase64: '', index: t.index, fileName: '', status: 'loading' }));
    setResults(initialResults);

    // Run all in parallel
    const promises = tasks.map(async (task, i) => {
      const result = await generateOne(task.image, task.style, task.index);
      setResults(prev => { const next = [...prev]; next[i] = result; return next; });
      setCompleted(prev => prev + 1);
      return result;
    });

    await Promise.all(promises);
    setLoading(false);
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login'); router.refresh();
  }

  const successCount = results.filter(r => r.status === 'done').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(17,17,24,0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c6bff, #ff6b9d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📸</div>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0 }}>Fotos de Producto Pro</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Potenciado por Flux AI</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>Cerrar sesión</button>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', background: 'linear-gradient(135deg, #f0f0f8 30%, #7c6bff 70%, #ff6b9d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '12px' }}>Fotos Profesionales con IA</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Subí una o varias fotos y generá imágenes profesionales listas para tu tienda.</p>
        </div>

        {/* Upload */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>1. Fotos del producto</label>
          <div onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
            style={{ border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(124,107,255,0.05)' : 'var(--surface)' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📷</div>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Arrastrá o hacé clic para subir</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>JPG, PNG, WebP — podés subir varias a la vez</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleFiles(e.target.files)} />
          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
              {imagePreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={src} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }} />
                  <button onClick={(e) => { e.stopPropagation(); removeImage(i); }} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ff4d6d', border: 'none', color: 'white', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Product Name (optional) */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>2. Nombre del producto <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
          <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ej: Organizador bambú — se usa para nombrar los archivos"
            style={{ width: '100%', padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
        </section>

        {/* Styles */}
        <section style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>3. Estilos de foto</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px' }}>
            {(Object.entries(styles) as [StyleKey, typeof STYLES[StyleKey]][]).map(([key, style]) => {
              const selected = selectedStyles.includes(key);
              return (
                <button key={key} onClick={() => toggleStyle(key)} style={{ padding: '18px', background: selected ? 'rgba(124,107,255,0.15)' : 'var(--surface)', border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '14px', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{style.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{style.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{style.description}</div>
                  {selected && <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>✓ Seleccionado</div>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Quantity */}
        <section style={{ marginBottom: '40px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>4. Variaciones por estilo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[1, 2, 3].map(n => (
              <button key={n} onClick={() => setQuantity(n)} style={{ width: '56px', height: '56px', borderRadius: '14px', background: quantity === n ? 'rgba(124,107,255,0.15)' : 'var(--surface)', border: `1.5px solid ${quantity === n ? 'var(--accent)' : 'var(--border)'}`, color: quantity === n ? 'var(--accent)' : 'var(--text)', fontSize: '20px', fontWeight: 700, cursor: 'pointer' }}>{n}</button>
            ))}
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>→ <strong style={{ color: 'var(--text)' }}>{totalImages} foto{totalImages !== 1 ? 's' : ''}</strong> en total</div>
          </div>
        </section>

        {error && <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', color: '#ff4d6d', fontSize: '14px' }}>⚠️ {error}</div>}

        <button onClick={handleGenerate} disabled={loading || images.length === 0}
          style={{ width: '100%', padding: '18px', background: loading || images.length === 0 ? 'rgba(124,107,255,0.3)' : 'linear-gradient(135deg, #7c6bff 0%, #a56bff 50%, #ff6b9d 100%)', border: 'none', borderRadius: '16px', color: 'white', fontSize: '18px', fontWeight: 700, cursor: loading || images.length === 0 ? 'not-allowed' : 'pointer' }}>
          {loading ? `Generando ${completed}/${total}...` : `Generar ${totalImages} foto${totalImages !== 1 ? 's' : ''} →`}
        </button>

        {results.length > 0 && (
          <section style={{ marginTop: '48px' }}>
            {!loading && (
              <div style={{ background: 'rgba(77,255,180,0.08)', border: '1px solid rgba(77,255,180,0.2)', borderRadius: '16px', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#4dffb4', fontWeight: 600 }}>✅ {successCount} generadas{errorCount > 0 && <span style={{ color: '#ff4d6d' }}> · {errorCount} errores</span>}</span>
                {successCount > 1 && <button onClick={downloadAll} style={{ background: 'rgba(107,255,218,0.1)', border: '1px solid rgba(107,255,218,0.3)', borderRadius: '10px', color: '#6bffda', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>⬇ Descargar todas</button>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {results.map((result, i) => (
                <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${result.status === 'error' ? 'rgba(255,77,109,0.3)' : 'var(--border)'}`, borderRadius: '16px', overflow: 'hidden' }}>
                  {result.status === 'loading' && (
                    <div style={{ aspectRatio: '9/16', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)' }}>
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>⏳ Generando...</div>
                    </div>
                  )}
                  {result.status === 'error' && (
                    <div style={{ padding: '16px' }}><p style={{ color: '#ff4d6d', fontSize: '13px' }}>❌ {result.error}</p></div>
                  )}
                  {result.status === 'done' && (
                    <>
                      <img src={`data:image/jpeg;base64,${result.imageBase64}`} alt={`${result.style} ${result.index}`} style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover' }} />
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{styles[result.style as StyleKey]?.label} — Var. {result.index}</p>
                        <button onClick={() => downloadImage(result.imageBase64, result.fileName)} style={{ width: '100%', padding: '8px', background: 'rgba(107,255,218,0.08)', border: '1px solid rgba(107,255,218,0.2)', borderRadius: '8px', color: '#6bffda', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>⬇ Descargar</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            {!loading && <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button onClick={() => { setResults([]); setImages([]); setImagePreviews([]); setProductName(''); }} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-muted)', padding: '12px 24px', fontSize: '14px', cursor: 'pointer' }}>Generar otro producto</button>
            </div>}
          </section>
        )}
      </main>
    </div>
  );
}
