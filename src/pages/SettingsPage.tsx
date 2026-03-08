import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '../api/client.ts';
import type { Settings } from '../api/client.ts';

const emptySettings: Settings = {
  ignoreSites: [],
  unavailableSites: [],
  ignoreTitles: [],
  maxSalary: null,
  nowResume: 5,
};

type ChipsProps = {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
};

const ChipsInput = ({ label, values, onChange, placeholder }: ChipsProps) => {
  const [draft, setDraft] = useState('');

  const addChip = () => {
    const v = draft.trim();
    if (!v) return;
    if (!values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip();
    }
  };

  return (
    <div className="field">
      <label>{label}</label>
      <div className="chips-input">
        {values.map((v) => (
          <span key={v} className="chip">
            {v}
            <span
              className="chip-remove"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              ×
            </span>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
      </div>
      <p className="muted">Press Enter to add, click × to remove.</p>
    </div>
  );
};

const SettingsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const [form, setForm] = useState<Settings>(emptySettings);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Copy API data into form once loaded
  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: Partial<Settings>) => updateSettings(payload),
    onSuccess: (s) => {
      setForm(s);
      setStatusMsg('Settings saved successfully.');
      setTimeout(() => setStatusMsg(null), 2500);
    },
    onError: (err: any) => {
      setStatusMsg(err?.message ?? 'Failed to save settings.');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    mutation.mutate(form); // send the form state
  };

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">
          Control filters, salary threshold, and automation batch sizes for resume generation.
        </p>
      </div>

      <form onSubmit={onSubmit} className="stack">
        <div className="stack">
          <div className="muted">Filters</div>
          <div className="form-grid">
            <ChipsInput
              label="Ignore sites (apply link starts with)"
              values={form.ignoreSites}
              onChange={(vals) => setForm((prev) => ({ ...prev, ignoreSites: vals }))}
              placeholder="linkedin.com"
            />

            <ChipsInput
              label="Unavailable companies"
              values={form.unavailableSites}
              onChange={(vals) => setForm((prev) => ({ ...prev, unavailableSites: vals }))}
              placeholder="capital one"
            />

            <ChipsInput
              label="Ignore titles (keywords)"
              values={form.ignoreTitles}
              onChange={(vals) => setForm((prev) => ({ ...prev, ignoreTitles: vals }))}
              placeholder="staff"
            />
          </div>
        </div>

        <div className="stack">
          <div className="muted">Salary & automation</div>
          <div className="form-grid">
            <div className="field">
              <label>Max salary (skip jobs below)</label>
              <input
                type="number"
                value={form.maxSalary ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maxSalary: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
              <p className="muted">
                Only keep jobs with a max salary greater than or equal to this value (if provided).
              </p>
            </div>

            <div className="field">
              <label>nowResume (resumes per Start in extension)</label>
              <input
                type="number"
                min={1}
                value={form.nowResume}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nowResume: Number(e.target.value) || 1 }))
                }
              />
              <p className="muted">
                Controls how many resumes the browser extension generates in one batch.
              </p>
            </div>
          </div>
        </div>

        <div className="card-actions">
          <button className="btn btn-primary" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save settings'}
          </button>
          {isLoading && <span className="muted">Loading current settings…</span>}
          {statusMsg && <span className="muted">{statusMsg}</span>}
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;