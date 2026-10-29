import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  X,
  Globe,
  ExternalLink,
  LoaderCircle,
  Download,
  Upload,
  Search,
  AlertTriangle,
  RefreshCw,
  Check,
  Folder,
  Tag,
  FolderPlus,
  Edit3
} from 'lucide-react';
import type { Feed } from '../types/index';
import { exportOpml, parseOpml } from '../features/feeds/opmlService';
import { validateFeedUrlInput } from '../utils/urlValidator';
import { InvalidUrlAlert } from '../components/ui/InvalidUrlAlert';

interface SubscriptionsPageProps {
  feeds: Feed[];
  onAddFeed: (url: string, folder?: string, tags?: string[]) => Promise<void>;
  onUpdateFeed?: (feedId: string, folder?: string, tags?: string[]) => Promise<void>;
  onRemoveFeed: (feed: Feed) => void;
  onRefresh?: () => void;
}

const COMMON_FOLDERS = ['Tech & Code', 'Design & Web', 'News & Media', 'Essays & Indie', 'Personal'];

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  feeds,
  onAddFeed,
  onUpdateFeed,
  onRemoveFeed,
  onRefresh
}) => {
  const [url, setUrl] = useState('');
  const [folderInput, setFolderInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('All');
  const [feedToDelete, setFeedToDelete] = useState<Feed | null>(null);
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [editFolderInput, setEditFolderInput] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlAlert, setUrlAlert] = useState<{
    isOpen: boolean;
    attemptedUrl: string;
    errorMessage: string;
    suggestion?: string;
  }>({
    isOpen: false,
    attemptedUrl: '',
    errorMessage: ''
  });

  const availableFolders = useMemo(() => {
    const set = new Set<string>();
    for (const f of feeds) {
      if (f.folder && f.folder.trim()) set.add(f.folder.trim());
    }
    return Array.from(set);
  }, [feeds]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isAdding) return;

    // Validate URL and detect invalid links immediately
    const validation = validateFeedUrlInput(url);
    if (!validation.valid) {
      setUrlAlert({
        isOpen: true,
        attemptedUrl: url,
        errorMessage: validation.error || 'Invalid URL format.',
        suggestion: validation.suggestion
      });
      return;
    }

    setIsAdding(true);
    setNotice(null);
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onAddFeed(
        validation.cleanUrl || url.trim(),
        folderInput.trim() || undefined,
        parsedTags.length > 0 ? parsedTags : undefined
      );
      setUrl('');
      setFolderInput('');
      setTagsInput('');
      setShowAdvancedAdd(false);
      setNotice('Feed added successfully.');
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Failed to add feed.';
      setNotice(msg);
      setUrlAlert({
        isOpen: true,
        attemptedUrl: url,
        errorMessage: msg,
        suggestion: 'Ensure the link points to a live website or valid RSS/Atom feed.'
      });
      setTimeout(() => setNotice(null), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEdit = (feed: Feed) => {
    setEditingFeed(feed);
    setEditFolderInput(feed.folder || '');
    setEditTagsInput(feed.tags ? feed.tags.join(', ') : '');
  };

  const handleSaveEdit = async () => {
    if (!editingFeed) return;
    try {
      const parsedTags = editTagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onUpdateFeed?.(
        editingFeed.id,
        editFolderInput.trim() || undefined,
        parsedTags.length > 0 ? parsedTags : undefined
      );
      setNotice(`Updated folder and tags for "${editingFeed.title}".`);
      setEditingFeed(null);
      setTimeout(() => setNotice(null), 3000);
    } catch {
      setNotice('Failed to update feed folder and tags.');
    }
  };

  const handleOpmlExport = () => {
    if (feeds.length === 0) {
      setNotice('No subscriptions to export.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    exportOpml(feeds);
    setNotice(`Exported ${feeds.length} subscriptions as OPML file.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseOpml(text);
      if (imported.length === 0) {
        setNotice('No valid RSS/Atom feed entries found in OPML file.');
        setTimeout(() => setNotice(null), 4000);
        return;
      }

      setNotice(`Importing ${imported.length} feeds from OPML…`);
      let successCount = 0;
      for (const item of imported) {
        try {
          await onAddFeed(item.feedUrl, item.folder, item.tags);
          successCount++;
        } catch {
          // Skip duplicates or broken feeds
        }
      }
      setNotice(`Successfully imported ${successCount} of ${imported.length} feeds.`);
      setTimeout(() => setNotice(null), 4000);
    } catch {
      setNotice('Failed to read OPML file.');
      setTimeout(() => setNotice(null), 3000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredFeeds = useMemo(() => {
    let result = feeds;
    if (selectedFolderFilter !== 'All') {
      if (selectedFolderFilter === 'Unfiled') {
        result = result.filter((f) => !f.folder || !f.folder.trim());
      } else {
        result = result.filter((f) => f.folder?.trim().toLowerCase() === selectedFolderFilter.toLowerCase());
      }
    }
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.feedUrl.toLowerCase().includes(q) ||
          f.siteUrl.toLowerCase().includes(q) ||
          f.folder?.toLowerCase().includes(q) ||
          f.tags?.some((t) => t.toLowerCase().includes(q)) ||
          (f.authorInfo?.username && f.authorInfo.username.toLowerCase().includes(q))
      );
    }
    return result;
  }, [feeds, filterQuery, selectedFolderFilter]);

  return (
    <section className="content">
      <div className="list-heading">
        <div>
          <div className="eyebrow">FEED MANAGER</div>
          <h1>Manage Subscriptions</h1>
          <p>Organize by folders, tag topics, and prune your RSS & Atom sources.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {onRefresh && (
            <button
              type="button"
              className="secondary-button"
              onClick={onRefresh}
              title="Refresh all feeds"
            >
              <RefreshCw size={14} /> Refresh All
            </button>
          )}
          <button
            type="button"
            className="secondary-button"
            onClick={handleOpmlExport}
            title="Export your subscriptions to standard OPML format"
          >
            <Download size={14} /> Export OPML
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => fileInputRef.current?.click()}
            title="Import an OPML file"
          >
            <Upload size={14} /> Import OPML
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".opml,.xml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {notice && (
        <div className="auth-alert info" style={{ marginBottom: '18px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Add Feed Form */}
      <div className="add-panel" style={{ margin: '0 0 24px', flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
          <div className="add-icon" style={{ flexShrink: 0 }}>
            <Plus size={20} />
          </div>
          <div className="add-copy" style={{ flex: 1 }}>
            <strong>Add New Subscription</strong>
            <span>Enter any RSS/Atom feed or site URL.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3d6148',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FolderPlus size={14} />
            {showAdvancedAdd ? 'Simple Add' : '+ Folder & Tags'}
          </button>
        </div>

        <form className="add-form" onSubmit={handleAdd} style={{ width: '100%', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', width: '100%', flexWrap: 'wrap' }}>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              style={{ flex: '1', minWidth: '240px' }}
            />
            <button type="submit" disabled={isAdding || !url.trim()}>
              {isAdding ? <LoaderCircle className="spin" size={16} /> : <Plus size={16} />} Add feed
            </button>
          </div>

          {showAdvancedAdd && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', width: '100%', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a604f', marginBottom: '3px' }}>
                  Folder / Category (optional)
                </label>
                <input
                  type="text"
                  list="folder-suggestions"
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  placeholder="e.g. Tech & Code"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #c8d6c5' }}
                />
                <datalist id="folder-suggestions">
                  {Array.from(new Set([...COMMON_FOLDERS, ...availableFolders])).map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div style={{ flex: '1', minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4a604f', marginBottom: '3px' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. dev, web, open-source"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #c8d6c5' }}
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Folder Filtering Toolbar */}
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#526654', marginRight: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Folder size={12} /> Folders:
          </span>
          <button
            type="button"
            className={`toolbar-filter-pill ${selectedFolderFilter === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedFolderFilter('All')}
            style={{ padding: '3px 10px', fontSize: '11.5px' }}
          >
            All ({feeds.length})
          </button>
          {availableFolders.map((folder) => {
            const count = feeds.filter((f) => f.folder?.trim().toLowerCase() === folder.toLowerCase()).length;
            return (
              <button
                key={folder}
                type="button"
                className={`toolbar-filter-pill ${selectedFolderFilter === folder ? 'active' : ''}`}
                onClick={() => setSelectedFolderFilter(folder)}
                style={{ padding: '3px 10px', fontSize: '11.5px' }}
              >
                {folder} ({count})
              </button>
            );
          })}
          {feeds.some((f) => !f.folder || !f.folder.trim()) && (
            <button
              type="button"
              className={`toolbar-filter-pill ${selectedFolderFilter === 'Unfiled' ? 'active' : ''}`}
              onClick={() => setSelectedFolderFilter('Unfiled')}
              style={{ padding: '3px 10px', fontSize: '11.5px' }}
            >
              Unfiled ({feeds.filter((f) => !f.folder || !f.folder.trim()).length})
            </button>
          )}
        </div>

        {/* Filter search bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#778877' }} />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by title, tag, or folder…"
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '9999px',
                border: '1px solid #dfe8dc',
                fontSize: '12.5px',
                outline: 'none',
                background: '#fff'
              }}
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#778877' }}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <span style={{ fontSize: '12px', color: '#687766' }}>
            Showing {filteredFeeds.length} of {feeds.length}
          </span>
        </div>
      </div>

      {/* Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredFeeds.map((feed) => (
          <div
            key={feed.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff',
              border: '1px solid #e5e9e1',
              borderRadius: '10px',
              padding: '14px 18px',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '260px' }}>
              <div className="feed-favicon">{feed.title.slice(0, 1).toUpperCase()}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px' }}>
                    {feed.title}
                  </h4>
                  {feed.authorInfo?.username && (
                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#4d6951' }}>
                      @{feed.authorInfo.username}
                    </span>
                  )}
                  {feed.folder && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '11px',
                        background: '#e9f2e7',
                        color: '#265436',
                        padding: '1px 8px',
                        borderRadius: '12px',
                        fontWeight: 500
                      }}
                    >
                      <Folder size={10} /> {feed.folder}
                    </span>
                  )}
                  {feed.tags && feed.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '10.5px',
                        background: '#f2f4f0',
                        color: '#4e6251',
                        padding: '1px 6px',
                        borderRadius: '8px'
                      }}
                    >
                      <Tag size={9} /> {t}
                    </span>
                  ))}
                </div>

                {feed.authorInfo?.catchPhrase && (
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#566657', fontStyle: 'italic' }}>
                    &ldquo;{feed.authorInfo.catchPhrase}&rdquo;
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a
                    href={feed.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '11px',
                      color: '#6e8571',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Globe size={12} /> {feed.siteUrl} <ExternalLink size={11} />
                  </a>
                  {feed.authorInfo?.city && (
                    <span style={{ fontSize: '11px', color: '#889887' }}>
                      📍 {feed.authorInfo.city}
                    </span>
                  )}
                  {feed.authorInfo?.companyName && (
                    <span style={{ fontSize: '11px', color: '#889887' }}>
                      🏢 {feed.authorInfo.companyName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="secondary-button"
                style={{ fontSize: '12px', padding: '6px 10px' }}
                onClick={() => handleOpenEdit(feed)}
                title="Change folder and tags"
              >
                <Edit3 size={13} /> Organize
              </button>
              <button
                type="button"
                className="secondary-button"
                style={{ color: '#a04232', flexShrink: 0, padding: '6px 10px' }}
                onClick={() => setFeedToDelete(feed)}
                title={`Unsubscribe from ${feed.title}`}
              >
                <X size={13} /> Remove
              </button>
            </div>
          </div>
        ))}

        {filteredFeeds.length === 0 && (
          <p style={{ textAlign: 'center', color: '#828e81', padding: '40px 0' }}>
            {filterQuery || selectedFolderFilter !== 'All'
              ? 'No subscriptions match your filter.'
              : 'No subscriptions added yet.'}
          </p>
        )}
      </div>

      {/* Edit Folder and Tags Dialog */}
      {editingFeed && (
        <div className="modal-backdrop" onClick={() => setEditingFeed(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2b5238', marginBottom: '10px' }}>
              <FolderPlus size={20} />
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                Organize: {editingFeed.title}
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#566657', margin: '0 0 16px' }}>
              Assign this blog to a folder and add relevant tags for fast navigation and OPML categorization.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334435', marginBottom: '4px' }}>
                Folder
              </label>
              <input
                type="text"
                list="modal-folder-options"
                value={editFolderInput}
                onChange={(e) => setEditFolderInput(e.target.value)}
                placeholder="e.g. Tech & Code, Design, News"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ccd8c9',
                  fontSize: '13px'
                }}
              />
              <datalist id="modal-folder-options">
                {Array.from(new Set([...COMMON_FOLDERS, ...availableFolders])).map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                {COMMON_FOLDERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setEditFolderInput(f)}
                    style={{
                      background: '#f0f4ee',
                      border: '1px solid #d8e2d6',
                      borderRadius: '10px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      color: '#345239'
                    }}
                  >
                    + {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334435', marginBottom: '4px' }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                placeholder="e.g. python, css, indieweb"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ccd8c9',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setEditingFeed(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => void handleSaveEdit()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsubscribe Confirmation Modal */}
      {feedToDelete && (
        <div className="modal-backdrop" onClick={() => setFeedToDelete(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b33939', marginBottom: '10px' }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                Unsubscribe from {feedToDelete.title}?
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to unsubscribe? Any articles or bookmarks you have saved from this feed will remain
              safely stored in your library.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setFeedToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-account-btn"
                onClick={() => {
                  onRemoveFeed(feedToDelete);
                  setFeedToDelete(null);
                }}
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invalid URL Alert Modal Dialog */}
      <InvalidUrlAlert
        isOpen={urlAlert.isOpen}
        onClose={() => setUrlAlert((prev) => ({ ...prev, isOpen: false }))}
        attemptedUrl={urlAlert.attemptedUrl}
        errorMessage={urlAlert.errorMessage}
        suggestion={urlAlert.suggestion}
      />
    </section>
  );
};
