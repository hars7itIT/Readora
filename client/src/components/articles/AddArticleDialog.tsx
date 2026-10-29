import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { articleService } from '../../features/articles/articleService';
import { Globe, PenLine, LoaderCircle, Plus, Tag, Database, Image as ImageIcon } from 'lucide-react';
import type { Post } from '../../types/index';

interface AddArticleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleAdded: (post: Post) => void;
  onImportSamplePosts?: () => Promise<void>;
  onImportSamplePhotos?: (limit?: number) => Promise<void>;
  onImportSampleAuthors?: () => Promise<void>;
}

export const AddArticleDialog: React.FC<AddArticleDialogProps> = ({
  isOpen,
  onClose,
  onArticleAdded,
  onImportSamplePosts,
  onImportSamplePhotos,
  onImportSampleAuthors
}) => {
  const [tab, setTab] = useState<'url' | 'manual' | 'sample' | 'photos'>('url');
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Manual form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseTags = () =>
    tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSaveFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError('');
    try {
      const post = await articleService.saveArticleFromUrl(url.trim(), parseTags());
      onArticleAdded(post);
      setUrl('');
      setTagsInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not extract article.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || loading) return;

    setLoading(true);
    setError('');
    try {
      const post = await articleService.createPost({
        title: title.trim(),
        author: author.trim() || 'You',
        content: content.trim(),
        link: link.trim(),
        tags: parseTags()
      });
      onArticleAdded(post);
      setTitle('');
      setAuthor('');
      setContent('');
      setLink('');
      setTagsInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save post.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport100 = async () => {
    if (!onImportSamplePosts || loading) return;
    setLoading(true);
    setError('');
    try {
      await onImportSamplePosts();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import sample posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportAuthors = async () => {
    if (!onImportSampleAuthors || loading) return;
    setLoading(true);
    setError('');
    try {
      await onImportSampleAuthors();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import authors.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportPhotos = async (limit?: number) => {
    if (!onImportSamplePhotos || loading) return;
    setLoading(true);
    setError('');
    try {
      await onImportSamplePhotos(limit);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import photo gallery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Post or Article">
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
        <button
          type="button"
          onClick={() => {
            setTab('url');
            setError('');
          }}
          style={{
            flex: 1,
            padding: '8px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '7px',
            border: '1px solid',
            borderColor: tab === 'url' ? '#386a4b' : '#dce3d8',
            background: tab === 'url' ? '#edf4e9' : '#fff',
            color: tab === 'url' ? '#274b33' : '#6f7a6e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <Globe size={13} /> Save from URL
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('manual');
            setError('');
          }}
          style={{
            flex: 1,
            padding: '8px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '7px',
            border: '1px solid',
            borderColor: tab === 'manual' ? '#386a4b' : '#dce3d8',
            background: tab === 'manual' ? '#edf4e9' : '#fff',
            color: tab === 'manual' ? '#274b33' : '#6f7a6e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <PenLine size={13} /> Write Post
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('sample');
            setError('');
          }}
          style={{
            flex: 1,
            padding: '8px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '7px',
            border: '1px solid',
            borderColor: tab === 'sample' ? '#386a4b' : '#dce3d8',
            background: tab === 'sample' ? '#edf4e9' : '#fff',
            color: tab === 'sample' ? '#274b33' : '#6f7a6e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <Database size={13} /> 100 Posts
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('photos');
            setError('');
          }}
          style={{
            flex: 1,
            padding: '8px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '7px',
            border: '1px solid',
            borderColor: tab === 'photos' ? '#386a4b' : '#dce3d8',
            background: tab === 'photos' ? '#edf4e9' : '#fff',
            color: tab === 'photos' ? '#274b33' : '#6f7a6e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
        >
          <ImageIcon size={13} /> Photo Gallery
        </button>
      </div>

      {tab === 'sample' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#576355', lineHeight: 1.6 }}>
            Import the entire 100-post dataset across the 10 author profiles (Leanne Graham, Ervin Howell, Clementine Bauch, Patricia Lebsack, etc.) with real author websites, company bios, tags, reading times, and states.
          </p>

          <div style={{ background: '#f5f8f4', border: '1px solid #dce8db', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: '#274b33', marginBottom: '4px' }}>
              Included 10 Authors:
            </div>
            <div style={{ fontSize: '11px', color: '#576355', lineHeight: 1.6 }}>
              Leanne Graham (@Bret), Ervin Howell (@Antonette), Clementine Bauch (@Samantha), Patricia Lebsack (@Karianne), Chelsey Dietrich (@Kamren), Mrs. Dennis Schulist (@Leopoldo_Corkery), Kurtis Weissnat (@Elwyn.Skiles), Nicholas Runolfsdottir V (@Maxime_Nienow), Glenna Reichert (@Delphine), Clementina DuBuque (@Moriah.Stanton).
            </div>
          </div>

          {error && (
            <div style={{ color: '#a04232', fontSize: '11px', background: '#fff0ee', padding: '8px 10px', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            {onImportSampleAuthors && (
              <button
                type="button"
                className="secondary-button"
                style={{ background: '#edf4e9', color: '#274b33', borderColor: '#cde0c7' }}
                onClick={handleImportAuthors}
                disabled={loading}
              >
                {loading ? <LoaderCircle className="spin" size={14} /> : <Plus size={14} />} Import 10 Author Feeds Only
              </button>
            )}
            <button
              type="button"
              className="secondary-button"
              style={{ background: '#315f40', color: '#fff', borderColor: '#315f40' }}
              onClick={handleImport100}
              disabled={loading}
            >
              {loading ? <LoaderCircle className="spin" size={14} /> : <Database size={14} />} Import All 100 Posts & Authors
            </button>
          </div>
        </div>
      ) : tab === 'photos' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#576355', lineHeight: 1.6 }}>
            Import photograph albums (from JSONPlaceholder photos dataset) with high-resolution image links,
            thumbnails, full gallery preview cards, and album categorization.
          </p>

          <div style={{ background: '#f5f8f4', border: '1px solid #dce8db', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', color: '#274b33', marginBottom: '4px' }}>
              Dataset Features:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: '#576355', lineHeight: 1.6 }}>
              <li>632 Curated photographs across 13 distinct albums</li>
              <li>Embedded responsive high-res photos and card thumbnails</li>
              <li>IndexedDB offline persistence and fast search</li>
            </ul>
          </div>

          {error && (
            <div style={{ color: '#a04232', fontSize: '11px', background: '#fff0ee', padding: '8px 10px', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="secondary-button"
              style={{ background: '#edf4e9', color: '#274b33', borderColor: '#cde0c7' }}
              onClick={() => handleImportPhotos(50)}
              disabled={loading}
            >
              {loading ? <LoaderCircle className="spin" size={14} /> : <ImageIcon size={14} />} Import 50 Photos
            </button>
            <button
              type="button"
              className="secondary-button"
              style={{ background: '#315f40', color: '#fff', borderColor: '#315f40' }}
              onClick={() => handleImportPhotos()}
              disabled={loading}
            >
              {loading ? <LoaderCircle className="spin" size={14} /> : <ImageIcon size={14} />} Import All 632 Photos
            </button>
          </div>
        </div>
      ) : tab === 'url' ? (
        <form onSubmit={handleSaveFromUrl} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#687366', lineHeight: 1.6 }}>
            Paste any article or blog post URL. Full text will be extracted and stored locally for
            distraction-free offline reading.
          </p>

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/blog/great-article"
            required
            style={{
              border: '1px solid #d9e2d6',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '12px',
              width: '100%',
              outline: 0
            }}
            autoFocus
          />

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6a7869', marginBottom: '4px' }}>
              <Tag size={12} /> Tags (comma-separated):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. tech, design, reading-list"
              style={{
                border: '1px solid #d9e2d6',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                width: '100%',
                outline: 0
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#a04232', fontSize: '11px', background: '#fff0ee', padding: '8px 10px', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="secondary-button"
              style={{ background: '#315f40', color: '#fff', borderColor: '#315f40' }}
              disabled={loading || !url.trim()}
            >
              {loading ? <LoaderCircle className="spin" size={14} /> : <Plus size={14} />} Save Article
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleCreateManual} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#404c3f', marginBottom: '4px' }}>
              Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              required
              style={{
                border: '1px solid #d9e2d6',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '12px',
                width: '100%',
                outline: 0
              }}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#6a7869', marginBottom: '4px' }}>
                Author / Source:
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Harshit"
                style={{
                  border: '1px solid #d9e2d6',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '11px',
                  width: '100%',
                  outline: 0
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#6a7869', marginBottom: '4px' }}>
                Original Link (optional):
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                style={{
                  border: '1px solid #d9e2d6',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '11px',
                  width: '100%',
                  outline: 0
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#404c3f', marginBottom: '4px' }}>
              Content / Article Body:
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article or thoughts here..."
              rows={6}
              required
              style={{
                border: '1px solid #d9e2d6',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                width: '100%',
                outline: 0,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6a7869', marginBottom: '4px' }}>
              <Tag size={12} /> Tags (comma-separated):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. notes, thoughts, personal"
              style={{
                border: '1px solid #d9e2d6',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '11px',
                width: '100%',
                outline: 0
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#a04232', fontSize: '11px', background: '#fff0ee', padding: '8px 10px', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="secondary-button"
              style={{ background: '#315f40', color: '#fff', borderColor: '#315f40' }}
              disabled={loading || !title.trim() || !content.trim()}
            >
              {loading ? <LoaderCircle className="spin" size={14} /> : <Plus size={14} />} Create Post
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
