import { useEffect, useRef, useState } from 'react';
import { workerOnline, type WorkerHeartbeat } from './studioModel';

export type StudioView = 'upload' | 'drops' | 'help';

export function WorkspaceHeader({
  view,
  onView,
  attention,
  draftCount,
  worker,
  connected,
  onRefresh,
  onOut,
  onBio,
  busy,
}: {
  view: StudioView;
  onView: (v: StudioView) => void;
  attention: number;
  draftCount: number;
  worker: WorkerHeartbeat | null;
  connected: boolean | null;
  onRefresh: () => void;
  onOut: () => void | Promise<void>;
  onBio?: () => void;
  busy: boolean;
}) {
  const account = useRef<HTMLDetailsElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [accountError, setAccountError] = useState('');
  const online = workerOnline(worker);
  const workerLabel =
    connected === false
      ? 'Connection lost'
      : connected === null
        ? 'Checking…'
        : !worker
          ? 'Status unavailable'
          : online
            ? worker.state === 'working'
              ? 'Processing a drop'
              : 'Available'
            : 'Offline';
  const showStatus =
    connected === false ||
    (connected === true && !!worker && (!online || worker.state === 'working'));
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (account.current && !account.current.contains(event.target as Node))
        account.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && account.current?.open) {
        account.current.open = false;
        account.current.querySelector('summary')?.focus();
      }
    };
    window.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', escape);
    };
  }, []);
  const signOut = async () => {
    if (busy || leaving) return;
    setLeaving(true);
    setAccountError('');
    try {
      await onOut();
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Could not sign out. Try again.');
    } finally {
      setLeaving(false);
    }
  };
  return (
    <>
      <header className="studio-header">
        <a
          href="https://www.imanolvillagomez.com"
          target="_blank"
          rel="noreferrer"
          className="studio-brand"
          aria-label="NOL website"
        >
          <span>NOL</span>
          <span>Studio</span>
        </a>
        <div className="studio-header-actions">
          {showStatus && (
            <span className="studio-header-status" role="status">
              {workerLabel}
            </span>
          )}
          <a
            href="https://www.imanolvillagomez.com"
            target="_blank"
            rel="noreferrer"
            className="studio-text-link studio-website-link"
          >
            View website <span aria-hidden>↗</span>
          </a>
          <details className="studio-account" ref={account}>
            <summary aria-label="Studio account">
              Nol{' '}
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                aria-hidden
              >
                <path d="m4 6 4 4 4-4" />
              </svg>
            </summary>
            <div className="studio-account-panel">
              <p className="studio-account-name">Nol’s studio</p>
              <dl>
                <dt>Processing</dt>
                <dd>{workerLabel}</dd>
              </dl>
              {onBio && (
                <button
                  onClick={() => {
                    if (account.current) account.current.open = false;
                    onBio();
                  }}
                >
                  Set up quick sign-in
                </button>
              )}
              <button onClick={signOut} disabled={busy || leaving}>
                {leaving ? (draftCount > 0 ? 'Saving draft…' : 'Signing out…') : 'Sign out'}
              </button>
              {busy && <p className="studio-account-note">Finish uploading before signing out.</p>}
              {accountError && (
                <p className="studio-account-error" role="alert">
                  {accountError}
                </p>
              )}
            </div>
          </details>
        </div>
      </header>
      <nav className="studio-navigation" aria-label="Studio">
        <button
          aria-label={draftCount > 0 ? `New drop, ${draftCount} files in draft` : 'New drop'}
          aria-current={view === 'upload' ? 'page' : undefined}
          onClick={() => onView('upload')}
        >
          <NavIcon kind="upload" />
          New drop{draftCount > 0 && <span className="studio-nav-count">{draftCount}</span>}
        </button>
        <button
          aria-label={attention > 0 ? `Your drops, ${attention} need attention` : 'Your drops'}
          aria-current={view === 'drops' ? 'page' : undefined}
          onClick={() => onView('drops')}
        >
          <NavIcon kind="drops" />
          Your drops
          {attention > 0 && <span className="studio-nav-count is-attention">{attention}</span>}
        </button>
        <button aria-current={view === 'help' ? 'page' : undefined} onClick={() => onView('help')}>
          <NavIcon kind="help" />
          Help
        </button>
      </nav>
      {connected === false && (
        <div className="studio-notice" role="alert">
          Could not refresh your drops. Your draft stays on this device.{' '}
          <button onClick={onRefresh}>Try again</button>
        </div>
      )}
      {worker && !online && connected && (
        <div className="studio-notice">
          The worker is unavailable right now. You can still upload; your drop will wait safely in
          the queue. Text Ian if it stays queued.
        </div>
      )}
    </>
  );
}

export function StudioHelp({
  onPractice,
  onNewDrop,
}: {
  onPractice: () => void;
  onNewDrop: () => void;
}) {
  return (
    <section className="studio-help">
      <h1>From new work to your website.</h1>
      <p className="studio-intro">You decide what goes live. The studio handles the preparation.</p>
      <ol className="studio-help-steps">
        <li>
          <h2>Add your work</h2>
          <p>
            Choose photos, videos, a ZIP, or a whole folder. Folders stay grouped. You can name each
            group and leave instructions for individual files.
          </p>
        </li>
        <li>
          <h2>Tell us where it goes</h2>
          <p>
            Review & send opens the title, city, placement and instructions. Your recent answers are
            saved as shortcuts. Keep this tab open until the upload finishes.
          </p>
        </li>
        <li>
          <h2>Check your preview</h2>
          <p>
            Follow the drop in Your drops. Answer any questions there. Open the preview, publish
            when it is right, or choose Needs changes to request another version.
          </p>
        </li>
      </ol>
      <div className="studio-help-notes">
        <h2>A few useful things</h2>
        <ul>
          <li>
            Two artists at once? Send them in one drop: make a folder for each artist, name it,
            add its instructions, and use the arrows to put the folders in the order you want on
            your site, top first.
          </li>
          <li>
            Up to 200 files per drop, and 5 GB per file. Split larger collections into multiple
            drops.
          </li>
          <li>
            Unsent work is saved on this device when browser storage is available. Drafts are not
            shared across devices or website addresses.
          </li>
          <li>Uploads need this tab open. Once a drop is queued, you can leave and come back.</li>
          <li>A failed drop can be retried without uploading all your files again.</li>
        </ul>
      </div>
      <div className="studio-actions">
        <button className="studio-button studio-button-primary" onClick={onNewDrop}>
          Add new work
        </button>
        <button className="studio-button" onClick={onPractice}>
          Try a practice drop
        </button>
      </div>
    </section>
  );
}

function NavIcon({ kind }: { kind: 'upload' | 'drops' | 'help' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {kind === 'upload' ? (
        <path d="M12 16V4m-4 4 4-4 4 4M5 15v5h14v-5" />
      ) : kind === 'drops' ? (
        <>
          <path d="M5 5h14v14H5zM5 10h14M10 10v9" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M10 9a2 2 0 1 1 3 1.7c-1 .6-1 1.3-1 2.3M12 16h.01" />
        </>
      )}
    </svg>
  );
}
