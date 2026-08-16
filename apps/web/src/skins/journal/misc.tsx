import { Link } from '@tanstack/react-router';

export function JournalNotFound() {
  return (
    <div className='j-nf'>
      <span className='j-seal' aria-hidden='true'>
        阙
      </span>
      <div className='zh' style={{ marginTop: 30 }}>
        404 Not Found
      </div>
      <p>你闯入了无人之境...</p>
      <p style={{ marginTop: 26 }}>
        <Link to='/blog' className='j-btn'>
          Back to blog
        </Link>
      </p>
    </div>
  );
}

export function JournalError({ error }: { error: unknown }) {
  return (
    <div className='j-sheet'>
      <h1 className='j-entry-title text-center'>Request Failed</h1>
      <p className='j-entry-meta text-center'>{String(error)}</p>
      <p className='j-backlink'>
        <Link to='/blog'>Back to blog</Link>
      </p>
    </div>
  );
}
