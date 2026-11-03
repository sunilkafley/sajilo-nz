const visaResources = [
  { title: 'Student visas', links: [
    { title: 'Visas for studying in New Zealand', url: 'https://www.immigration.govt.nz/study/study-visas/visas-for-studying-in-new-zealand/' },
    { title: 'Fee Paying Student Visa', url: 'https://www.immigration.govt.nz/visas/fee-paying-student-visa/' },
  ] },
  { title: 'Work visas', links: [{ title: 'Visas for working in New Zealand', url: 'https://www.immigration.govt.nz/work/visas-for-working-in-new-zealand/' }] },
  { title: 'Visitor visas', links: [{ title: 'Visitor Visa', url: 'https://www.immigration.govt.nz/visas/visitor-visa/' }] },
  { title: 'Residence', links: [{ title: 'Resident visas to live in New Zealand', url: 'https://www.immigration.govt.nz/live/resident-visas-to-live-in-new-zealand/' }, { title: 'Permanent Resident Visa', url: 'https://www.immigration.govt.nz/visas/permanent-resident-visa/' }] },
];

export function ImmigrationResources() {
  return <div lang="en" className="immigration-resources">
    <section aria-labelledby="visa-resources-heading">
      <h2 id="visa-resources-heading">Visa information from Immigration New Zealand</h2>
      <p>Explore official visa information online. Check the relevant INZ page for current details.</p>
      <div className="topic-articles">{visaResources.map(group => <section className="card" key={group.title}>
        <h3>{group.title}</h3><ul>{group.links.map(link => <li key={link.url}><a href={link.url} rel="noopener noreferrer">{link.title} (INZ)</a></li>)}</ul>
      </section>)}</div>
      <p><a href="https://www.immigration.govt.nz/process-to-apply/find-a-visa-tool/" rel="noopener noreferrer">Find and choose a visa (INZ)</a> · <a href="https://www.iaa.govt.nz/for-migrants/" rel="noopener noreferrer">Immigration advice for migrants (Immigration Advisers Authority)</a></p>
    </section>
    <section className="card immigration-news" aria-labelledby="immigration-news-heading">
      <h2 id="immigration-news-heading">Latest immigration news</h2>
      <p>Read the latest announcements directly from Immigration New Zealand. News is available online on the INZ website.</p>
      <a href="https://www.immigration.govt.nz/about-us/news-centre/" rel="noopener noreferrer">Visit the INZ news centre</a>
    </section>
  </div>;
}

