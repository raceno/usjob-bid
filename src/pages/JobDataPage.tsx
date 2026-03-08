import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { fetchJobs, openNextJobs } from '../api/client.ts';
import type { Job } from '../api/client.ts';

const JobDataPage = () => {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  const openMutation = useMutation({
    mutationFn: () => openNextJobs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const STORAGE_KEY = 'jobData.filters';

  const [onlyWithResume, setOnlyWithResume] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).onlyWithResume : false;
  });
  const [onlyNotApplied, setOnlyNotApplied] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).onlyNotApplied : false;
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ onlyWithResume, onlyNotApplied })
    );
  }, [onlyWithResume, onlyNotApplied]);

  const rows: Job[] = useMemo(() => {
    const base = Array.isArray(jobs) ? jobs : [];
    return base.filter((job) => {
      if (onlyWithResume && job.resumeStatus !== 'done') return false;
      const opened = job.opened || job.status === 'applied';
      if (onlyNotApplied && opened) return false;

      // Search filter
      const query = searchQuery.toLowerCase();
      if (
        query &&
        !(
          job.company.toLowerCase().includes(query) ||
          job.title.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query)
        )
      ) {
        return false;
      }

      return true;
    });
  }, [jobs, onlyWithResume, onlyNotApplied, searchQuery]);

  const handleOpenClick = () => {
    if (openMutation.isPending) return;

    openMutation.mutate(undefined, {
      onSuccess: (opened) => {
        const job = opened?.[0];
        if (!job?.applyLink) return;

        window.open(job.applyLink, '_blank', 'noopener,noreferrer');
      },
    });
  };

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Job data</h1>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Jobs</div>
            <div className="card-subtitle">
              {isLoading
                ? 'Loading jobs…'
                : `${rows.length} shown / ${(jobs ?? []).length} total in MongoDB`}
            </div>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleOpenClick}
              disabled={openMutation.isPending}
            >
              {openMutation.isPending ? 'Opening…' : 'Open next job'}
            </button>
          </div>
        </div>

        <div className="table-toolbar">
          <div className="muted">
            {isLoading
              ? 'Fetching latest jobs from backend…'
              : 'Ready. Use filters or search to focus on specific jobs.'}
          </div>

          <div className="table-filters" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by company, title, or location…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <label className="toggle-label">
              <div className="toggle">
                <input
                  type="checkbox"
                  checked={onlyWithResume}
                  onChange={(e) => setOnlyWithResume(e.target.checked)}
                />
                <span className="slider" />
              </div>
              <span>Only with resume</span>
            </label>
            <label className="toggle-label">
              <div className="toggle">
                <input
                  type="checkbox"
                  checked={onlyNotApplied}
                  onChange={(e) => setOnlyNotApplied(e.target.checked)}
                />
                <span className="slider" />
              </div>
              <span>Only not applied yet</span>
            </label>
          </div>
        </div>

        {isError && (
          <div className="card" style={{ marginBottom: '0.75rem', borderColor: '#f97373' }}>
            <div className="card-title">Failed to load jobs</div>
            <p className="muted">
              {(error as Error)?.message ?? 'Unknown error'} — refresh the page to try again.
            </p>
          </div>
        )}

        <div style={{ overflowX: 'auto', maxHeight: '65vh' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Title</th>
                <th>Location</th>
                <th>Remote</th>
                <th>Posted</th>
                <th>Salary</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Apply link</th>
                <th>Resume link</th>
                <th>Cover link</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={11}>
                    <span className="muted">
                      No jobs match the current filters or search. Try adjusting filters or query.
                    </span>
                  </td>
                </tr>
              )}
              {rows.map((job) => {
                const hasResume = job.resumeStatus === 'done';
                const opened = job.opened || job.status === 'applied';

                const rowClassNames = [
                  'table-row',
                  hasResume ? 'row-resume-done' : '',
                  opened ? 'row-opened' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                const resumeLabel =
                  job.resumeStatus === 'done'
                    ? 'Ready'
                    : job.resumeStatus === 'in_progress'
                    ? 'In progress'
                    : job.resumeStatus === 'failed'
                    ? 'Failed'
                    : 'None';

                const statusLabel = opened ? 'Applied' : 'New';

                return (
                  <tr key={job._id} className={rowClassNames}>
                    <td>{job.company}</td>
                    <td>{job.title}</td>
                    <td>{job.location}</td>
                    <td>{job.remote ? 'Yes' : 'No'}</td>
                    <td>{new Date(job.posted).toLocaleDateString()}</td>
                    <td>{job.salary}</td>
                    <td>
                      <span
                        className={[
                          'badge',
                          job.resumeStatus === 'done'
                            ? 'badge-success'
                            : job.resumeStatus === 'in_progress'
                            ? 'badge-info'
                            : 'badge-muted',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {resumeLabel}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-muted">{statusLabel}</span>
                    </td>
                    <td>
                      {job.applyLink && (
                        <a href={job.applyLink} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      )}
                    </td>
                    <td>
                      {job.resumePath && (
                        <a href={job.resumePath} target="_blank" rel="noreferrer">
                          Resume
                        </a>
                      )}
                    </td>
                    <td>
                      {job.coverPath && (
                        <a href={job.coverPath} target="_blank" rel="noreferrer">
                          Cover
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobDataPage;