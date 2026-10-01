import React from 'react';
import type { RepresentativeData } from '../types';
import { IndividualStatusBreakdown } from './IndividualStatusBreakdown';
import { AuthorshipScopeMatrix } from './AuthorshipScopeMatrix';
import { PolicyPortfolioGraph } from './PolicyPortfolioGraph';
import { FilingCadenceTimeline } from './FilingCadenceTimeline';

interface Props {
  currentRep: RepresentativeData;
  onSelectStatusFilter?: (statusKeyword: string) => void;
}

export const RepresentativeIndividualAnalytics: React.FC<Props> = ({
  currentRep,
  onSelectStatusFilter,
}) => {
  return (
    <div className="space-y-6 font-sans">
      {/* Grid Layout: 4 Individual Analytics Graphs */}
      <div className="space-y-6">
        {/* Row 1: Status Donut & Authorship-Scope 2x2 Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IndividualStatusBreakdown
            currentRep={currentRep}
            onSelectStatusFilter={onSelectStatusFilter}
          />
          <AuthorshipScopeMatrix currentRep={currentRep} />
        </div>

        {/* Row 2: Policy Portfolio Committees & Filing Cadence Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PolicyPortfolioGraph currentRep={currentRep} />
          <FilingCadenceTimeline currentRep={currentRep} />
        </div>
      </div>
    </div>
  );
};
