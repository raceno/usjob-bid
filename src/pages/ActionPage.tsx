import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '../api/client.ts';

const ActionPage = () => {
  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const total = jobs?.length ?? 0;
  const resumeDone = jobs?.filter((j) => j.resumeStatus === 'done').length ?? 0;
  const applied = jobs?.filter((j) => j.status === 'applied' || j.opened).length ?? 0;

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Pipeline overview</h1>
        <p className="page-subtitle">
          High-level metrics for your JD → resume → application flow. Use this as a quick health
          check before running automation.
        </p>
      </div>

      <div className="form-grid">
        <div className="card">
          <div className="card-subtitle">Total jobs tracked</div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.25rem' }}>{total}</div>
        </div>
        <div className="card">
          <div className="card-subtitle">Resumes ready</div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.25rem' }}>
            {resumeDone}
          </div>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Jobs where the extension has already generated a resume and cover letter.
          </p>
        </div>
        <div className="card">
          <div className="card-subtitle">Applied / opened</div>
          <div style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.25rem' }}>
            {applied}
          </div>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Jobs whose application tabs have been opened via the Open button.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionPage;

