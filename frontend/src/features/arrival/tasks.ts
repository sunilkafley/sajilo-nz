// Independent stable IDs. Labels are unreviewed planning prompts, not requirements.
export const arrivalTasks = [
  {id:'arrival-accommodation',label:'Check accommodation arrival arrangements',group:'Settle in'},
  {id:'arrival-connectivity',label:'Plan phone and internet access',group:'Settle in'},
  {id:'arrival-transport',label:'Plan a local journey',group:'Settle in'},
  {id:'arrival-provider',label:'Contact your education provider about orientation',group:'Get ready for study'},
  {id:'arrival-support',label:'Find your provider’s student support contacts',group:'Get ready for study'},
  {id:'arrival-budget',label:'Review your first-week budget',group:'Get ready for study'},
] as const;
export const arrivalGroups = ['Settle in','Get ready for study'] as const;
