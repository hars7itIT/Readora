import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Plus, LoaderCircle } from 'lucide-react';
import { validateFeedUrlInput } from '../../utils/urlValidator';
import { InvalidUrlAlert } from '../ui/InvalidUrlAlert';

interface AddFeedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeed: (url: string) => Promise<void>;
}

export const AddFeedDialog: React.FC<AddFeedDialogProps> = ({ isOpen, onClose, onAddFeed }) => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alertDetails, setAlertDetails] = useState<{
    isOpen: boolean;
    attemptedUrl: string;
    errorMessage: string;
    suggestion?: string;
  }>({
    isOpen: false,
    attemptedUrl: '',
    errorMessage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isSubmitting) return;

    // Validate link before submission
    const validation = validateFeedUrlInput(url);
    if (!validation.valid) {
      setAlertDetails({
        isOpen: true,
        attemptedUrl: url,
        errorMessage: validation.error || 'Invalid URL format.',
        suggestion: validation.suggestion
      });
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onAddFeed(validation.cleanUrl || url.trim());
      setUrl('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add feed.';
      setError(msg);
      setAlertDetails({
        isOpen: true,
        attemptedUrl: url,
        errorMessage: msg,
        suggestion: 'Ensure the link points to a live website or valid RSS/Atom feed.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose} title="Subscribe to Feed or Site">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#687366', lineHeight: 1.6 }}>
          Enter a website address (e.g. <code>https://jvns.ca</code>) or a direct RSS/Atom feed URL.
        </p>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/rss.xml"
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#3c5a45' }}>Blogger API Blogs:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setUrl('http://code.blogger.com/')}
              style={{ background: '#f2f6f1', border: '1px solid #c9d8c6', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', color: '#1e3827' }}
            >
              + Blogger Developers Network
            </button>
            <button
              type="button"
              onClick={() => setUrl('http://brettmorgan-test-blawg.blogspot.com/')}
              style={{ background: '#f2f6f1', border: '1px solid #c9d8c6', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', color: '#1e3827' }}
            >
              + Brett's Test Blawg
            </button>
            <button
              type="button"
              onClick={() => setUrl('http://buzz.blogger.com/')}
              style={{ background: '#f2f6f1', border: '1px solid #c9d8c6', borderRadius: '4px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', color: '#1e3827' }}
            >
              + Blogger Buzz
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color: '#a04232', fontSize: '11px', background: '#fff0ee', padding: '8px 10px', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button type="button" className="secondary-button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="secondary-button"
            style={{ background: '#315f40', color: '#fff', borderColor: '#315f40' }}
            disabled={isSubmitting || !url.trim()}
          >
            {isSubmitting ? <LoaderCircle className="spin" size={14} /> : <Plus size={14} />}
            Add Subscription
          </button>
        </div>
      </form>
    </Dialog>

    <InvalidUrlAlert
      isOpen={alertDetails.isOpen}
      onClose={() => setAlertDetails((prev) => ({ ...prev, isOpen: false }))}
      attemptedUrl={alertDetails.attemptedUrl}
      errorMessage={alertDetails.errorMessage}
      suggestion={alertDetails.suggestion}
    />
  </>
  );
};
