import { ArrowLeft, ArrowUpRight, FileText, Files, ChartNoAxesColumn, Mail, History, Search, Plus, ShieldCheck } from 'lucide-react';
import { Link, path } from './ui';
import type { Tender } from './domain';
export default function WorkspaceNav({ route, tender }: { route: string; tender: Tender }) {
  const active = route.split('/')[2] || 'brief';
  const steps = [['brief', 'The brief', FileText], ['quotes', 'Quotations', Files], ['compare', 'Comparison', ChartNoAxesColumn], ['drafts', 'Messages', Mail], ['activity', 'Activity & evidence', History]] as const;
  return <aside className="ql-workspace-nav">
    <Link to="tenders" className="ql-workspace-back"><ArrowLeft size={14}/> All tenders</Link>
    <div className="ql-workspace-project"><span><FileText size={18}/></span><div><strong>{tender.brief.title}</strong><small>{tender.sample ? 'Example workspace' : 'Your tender workspace'}</small></div></div>
    <span className="ql-nav-label">YOUR WORKSPACE</span>
    <nav aria-label="Tender workspace">{steps.map(([key, label, Icon], index) => { const current = active === key || active === 'review' && key === 'quotes'; return <Link key={key} to={path(tender.id, key)} className={current ? 'active' : ''} aria-current={current ? 'page' : undefined}><Icon size={17}/><span>{label}</span>{key === 'quotes' ? <small>{tender.offers.length}</small> : <small className="ql-nav-index">0{index + 1}</small>}</Link>; })}</nav>
    <div className="ql-workspace-extra"><Link to="suppliers"><Search size={16}/> Find a supplier <ArrowUpRight size={12}/></Link><Link to="new"><Plus size={16}/> New tender</Link></div>
    <div className="ql-workspace-note"><ShieldCheck size={20}/><strong>Your priorities.<br/>A clearer perspective.</strong><p>Keep the brief, offers and next steps together.</p></div>
  </aside>;
}
