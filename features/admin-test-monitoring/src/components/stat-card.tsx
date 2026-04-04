'use client';

import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, iconClassName }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ${iconClassName ?? ''}`}
    >
      {icon}
    </div>
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
  </div>
);

export default StatCard;
