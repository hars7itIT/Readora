import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, Check } from 'lucide-react';
import { commentService } from '../../features/articles/commentService';
import type { ArticleComment } from '../../types/index';

interface ArticleCommentsProps {
  postId: string | number;
}

export const ArticleComments: React.FC<ArticleCommentsProps> = ({ postId }) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New comment form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const list = await commentService.getCommentsForPost(postId);
      setComments(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !commentBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const added = await commentService.addComment({
        postId,
        name: authorName.trim(),
        email: authorEmail.trim() || 'reader@smallweb.local',
        body: commentBody.trim()
      });
      setComments((prev) => [...prev, added]);
      setCommentBody('');
      setSubmitNotice(true);
      setTimeout(() => setSubmitNotice(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedComments = async () => {
    await commentService.importSampleComments();
    await loadComments();
  };

  return (
    <div
      style={{
        marginTop: '36px',
        padding: '24px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #e2e8df',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid #edf1eb',
          paddingBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={17} color="#274b33" />
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1f3524', fontWeight: 600 }}>
            Reader Discussion ({comments.length})
          </h3>
        </div>
        {comments.length === 0 && (
          <button
            type="button"
            className="secondary-button"
            style={{ fontSize: '11px', padding: '4px 8px' }}
            onClick={handleSeedComments}
          >
            Load Sample Discussion
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ fontSize: '12px', color: '#7a8878' }}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#7a8878', fontStyle: 'italic', margin: '14px 0' }}>
          No comments yet. Start the conversation below!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {comments.map((c) => {
            const initial = (c.name || 'A').slice(0, 1).toUpperCase();
            return (
              <div
                key={String(c.id)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 14px',
                  background: '#f8faf7',
                  borderRadius: '8px',
                  border: '1px solid #edf2ea'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#e3ece1',
                    color: '#284d34',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#273829' }}>
                      {c.name}
                      {c.email && (
                        <span style={{ marginLeft: '6px', fontWeight: 400, fontSize: '11px', color: '#718370' }}>
                          &lt;{c.email}&gt;
                        </span>
                      )}
                    </div>
                    {c.createdAt && (
                      <span style={{ fontSize: '10px', color: '#8d9c8b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} /> {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: '6px 0 0 0',
                      fontSize: '12px',
                      lineHeight: 1.55,
                      color: '#475545',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {c.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write a comment form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: '16px',
          padding: '16px',
          background: '#fafcf9',
          borderRadius: '8px',
          border: '1px solid #e5ebe2'
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '12px', color: '#273829', marginBottom: '10px' }}>
          Leave a Comment or Response
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name *"
            required
            style={{
              padding: '7px 10px',
              fontSize: '11px',
              border: '1px solid #dbe2d8',
              borderRadius: '6px',
              outline: 0
            }}
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Your email (optional)"
            style={{
              padding: '7px 10px',
              fontSize: '11px',
              border: '1px solid #dbe2d8',
              borderRadius: '6px',
              outline: 0
            }}
          />
        </div>

        <textarea
          value={commentBody}
          onChange={(e) => setCommentBody(e.target.value)}
          placeholder="Share your thoughts, critiques, or reflections on this post…"
          rows={3}
          required
          style={{
            width: '100%',
            padding: '8px 10px',
            fontSize: '12px',
            lineHeight: 1.5,
            border: '1px solid #dbe2d8',
            borderRadius: '6px',
            outline: 0,
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          {submitNotice ? (
            <span style={{ fontSize: '11px', color: '#274b33', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={13} /> Comment posted to local discussion!
            </span>
          ) : (
            <span style={{ fontSize: '10px', color: '#889887' }}>Stored locally in offline database</span>
          )}

          <button
            type="submit"
            className="secondary-button"
            style={{ background: '#315f40', color: '#fff', borderColor: '#315f40', fontSize: '11px', padding: '6px 14px' }}
            disabled={isSubmitting || !authorName.trim() || !commentBody.trim()}
          >
            <Send size={12} /> Post Comment
          </button>
        </div>
      </form>
    </div>
  );
};
