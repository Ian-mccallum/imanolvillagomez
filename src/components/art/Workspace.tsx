import { formatBytes, workerOnline, type WorkerHeartbeat } from './studioModel';

export type StudioView = 'upload' | 'drops' | 'help';

export function WorkspaceHeader({
  view,
  onView,
  attention,
  draftCount,
  draftBytes,
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
  draftBytes: number;
  worker: WorkerHeartbeat | null;
  connected: boolean | null;
  onRefresh: () => void;
  onOut: () => void;
  onBio?: () => void;
  busy: boolean;
}) {
  const online = workerOnline(worker);
  const label =
    connected === false
      ? 'Connection lost'
      : connected === null
        ? 'Connecting…'
        : !worker
          ? 'Worker status unavailable'
          : online
            ? worker.state === 'working'
              ? 'Preparing work'
              : 'Studio is ready'
            : 'Worker is away';
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
          <span
            className={`studio-availability ${online && connected ? 'is-online' : ''}`}
            role="status"
          >
            <i aria-hidden />
            {label}
          </span>
          <a
            href="https://www.imanolvillagomez.com"
            target="_blank"
            rel="noreferrer"
            className="studio-text-link studio-website-link"
          >
            View website <span aria-hidden>↗</span>
          </a>
          {onBio && (
            <button className="studio-text-link" onClick={onBio}>
              Quick sign-in
            </button>
          )}
          <button className="studio-text-link" onClick={onOut} disabled={busy}>
            Sign out
          </button>
        </div>
      </header>
      <nav className="studio-navigation" aria-label="Studio">
        <button
          aria-label={draftCount > 0 ? `New drop, ${draftCount} files in draft` : 'New drop'}
          aria-current={view === 'upload' ? 'page' : undefined}
          onClick={() => onView('upload')}
        >
          New drop{draftCount > 0 && <span className="studio-nav-count">{draftCount}</span>}
        </button>
        <button
          aria-label={attention > 0 ? `Your drops, ${attention} need attention` : 'Your drops'}
          aria-current={view === 'drops' ? 'page' : undefined}
          onClick={() => onView('drops')}
        >
          Your drops
          {attention > 0 && <span className="studio-nav-count is-attention">{attention}</span>}
        </button>
        <button aria-current={view === 'help' ? 'page' : undefined} onClick={() => onView('help')}>
          How it works
        </button>
        {draftCount > 0 && (
          <span className="studio-nav-draft">{formatBytes(draftBytes)} in your draft</span>
        )}
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
