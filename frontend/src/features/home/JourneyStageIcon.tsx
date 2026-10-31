type Stage = 'departure' | 'arrival' | 'settling' | 'work';

const shapes: Record<Stage, string> = {
  departure: 'm28 3-7 12 9 6-2 3-11-3-6 9-3-1 3-12-9-6 1-3 11 3 11-9z',
  arrival: 'M2 15 16 3l14 12-3 3-3-3v15h-6V20h-5v10H7V15l-3 3z',
  settling: 'M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10m12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8M2 29v-5a10 10 0 0 1 20 0v5zm22 0v-5a13 13 0 0 0-3-8c6-1 10 3 10 8v5z',
  work: 'M11 3h10a3 3 0 0 1 3 3v3h4a3 3 0 0 1 3 3v5l-13 5h-4L1 17v-5a3 3 0 0 1 3-3h4V6a3 3 0 0 1 3-3m0 6h10V6H11zM1 20l12 5h6l12-5v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3z',
};

export function JourneyStageIcon({ stage }: { stage: Stage }) {
  return <span className={'journey-stage-icon stage-'+stage}><svg viewBox="0 0 32 34" aria-hidden="true" focusable="false"><path d={shapes[stage]} fill="currentColor"/></svg></span>;
}
