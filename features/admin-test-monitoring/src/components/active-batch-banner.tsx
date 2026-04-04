'use client';

import React from 'react';
import { FiPlay } from '@xgen/icons';
import type { ActiveSession } from '../types';

interface ActiveBatchBannerProps {
  session: ActiveSession;
  runningLabel: string;
}

const ActiveBatchBanner: React.FC<ActiveBatchBannerProps> = ({ session, runningLabel }) => {
  if (!session.is_running) return null;

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-success/5 p-4">
      <div className="mb-3 flex items-center gap-3">
        <FiPlay className="h-5 w-5 animate-pulse text-success" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">
            {runningLabel}: {session.workflow_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {session.completed_count} / {session.total_count} ({session.progress.toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-300"
          style={{ width: `${session.progress}%` }}
        />
      </div>
    </div>
  );
};

export default ActiveBatchBanner;
