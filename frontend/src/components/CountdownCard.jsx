import React, { useState, useEffect } from 'react';

export default function CountdownCard({ schedule }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!schedule || schedule.length === 0) return null;

  const getCountdown = (isoDate) => {
    if (!isoDate) return { text: 'Unknown', status: 'upcoming' };
    const examDate = new Date(isoDate);
    const diff = examDate - now;

    if (diff < 0) {
      // Check if it's still today
      if (examDate.toDateString() === now.toDateString()) {
        return { text: 'TODAY', status: 'today' };
      }
      return { text: 'Done', status: 'passed' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0 && hours === 0) return { text: 'TODAY', status: 'today' };

    return {
      text: `${days} days ${hours} hrs`,
      status: 'upcoming'
    };
  };

  return (
    <div className="glass-panel p-4 mb-6 flex flex-col gap-3">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-glow mb-1">Exam Countdown</h3>
      <div className="space-y-3">
        {schedule.map((exam, i) => {
          const countdown = getCountdown(exam.datetime_iso);
          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {exam.subject.length > 40 ? exam.subject.substring(0, 37) + '...' : exam.subject}
                </p>
                <p className="text-[10px] text-milk-dim/60 font-mono mt-0.5">
                  {exam.date} @ {exam.time}
                </p>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-[11px] font-bold font-mono whitespace-nowrap
                ${countdown.status === 'today' ? 'bg-success/20 text-success' :
                  countdown.status === 'passed' ? 'bg-white/5 text-milk-dim/40' :
                  'bg-accent/10 text-accent'}
              `}>
                {countdown.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
