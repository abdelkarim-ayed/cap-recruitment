import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { applicationStages } from '@recruitment/domain';
import './style.css';

function App() {
  const [connection, setConnection] = useState('Checking API connection…');
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/health', { signal: abort.signal }).then(response => {
      if (!response.ok) throw new Error('API unavailable');
      return response.json();
    }).then(() => setConnection('API connected')).catch(error => {
      if (error.name !== 'AbortError') setConnection('API unavailable — start the backend');
    });
    return () => abort.abort();
  }, []);
  return <main><span className="eyebrow">RECRUITMENT PLATFORM · FOUNDATION CHECKPOINT</span>
    <h1>One workspace for your next hire.</h1>
    <p>Company vacancies, applications, review, and interviews.</p>
    <section><h2>Foundation is running</h2><p role="status">{connection}</p>
      <p>This is the initial application shell. Authentication and recruitment screens are next—not implemented here yet.</p>
      <ol>{applicationStages.map(stage => <li key={stage}>{stage.replaceAll('_', ' ')}</li>)}</ol>
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);
