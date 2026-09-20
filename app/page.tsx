'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setError(null);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const cleanUrl = result
    ? result.secure_url.replace(
        '/upload/',
        '/upload/e_background_removal,c_auto,g_auto,f_auto,q_auto/'
      )
    : null;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">ListingLens</h1>
          <p className="text-gray-600 mt-2">
            Turn messy seller photos into marketplace-ready product images.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Selected file:</p>
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 rounded border"
              />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {loading ? 'Processing...' : 'Clean and Tag'}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Before</h2>
              <img
                src={result.secure_url}
                alt="Original"
                className="w-full rounded border"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-3">After</h2>
              <img
                src={cleanUrl}
                alt="Cleaned"
                className="w-full rounded border bg-gray-100"
              />

              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Tags detected
                </h3>
                {result.tags && result.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No tags detected.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}