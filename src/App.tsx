import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ArrowUpRight, Check, Menu, X, CircleHelp, ChevronRight, Plus, LockKeyhole, MapPin, CalendarDays, FileText } from 'lucide-react';
import { useCloudWorkspace } from './useCloudWorkspace';
import { Context, Logo, Link, Badge, Button, Modal, Empty, path } from './ui';
import { date } from './domain';
import Landing from './FramerLanding';
import WorkspaceNav from './WorkspaceNav';
import Auth from './Auth';
import { Tenders, NewTender, TenderBrief } from './Tenders';
import { Quotations, QuotationReview } from './Quotations';
import Comparison from './AIComparison';
import { Drafts, Activity } from './Communication';
import { SupplierDirectory, SupplierPortfolio, PortfolioForm } from './Suppliers';
import Lumi from './Lumi';
const getRoute = () => location.hash.replace(/^#\/?/, '').split('?')[0];
const tabNames: Record<string, string> = { brief: 'The brief', quotes: 'Quotations', review: 'Review quotation', compare: 'Comparison', drafts: 'Messages', activity: 'Activity & evidence' };
export default function App() {
  const [route, setRoute] = useState(getRoute);
  const {store,setStore,user,ready,syncError,syncing,syncNow,refreshSession,logout,acceptRemote}=useCloudWorkspace();
  const [toast, setToast] = useState('');
  const [info, setInfo] = useState(false);
  const [menu, setMenu] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const first = useRef(true);
  const mainFocus = useRef<HTMLDivElement>(null);
  const go = (s: string) => { location.hash = `/${s}`; };
  const notify = (s: string) => { setToast(s); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 5000); };
  useEffect(() => { const change = () => { setRoute(getRoute()); setMenu(false); window.scrollTo({ top: 0 }); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);

  useEffect(() => { if (first.current) { first.current = false; return; } mainFocus.current?.focus({ preventScroll: true }); }, [route]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const parts = route.split('/'), id = parts[1], tab = parts[2] || 'brief';
  const tender = parts[0] === 'tender' ? store.tenders.find(t => t.id === id) : undefined;
  const isHome = !route, isAuth = ['login', 'signup', 'forgot-password'].includes(route);
  const workspace = !!tender;
  useEffect(()=>{if(ready&&!user&&!isHome&&!isAuth)go(`login?next=${encodeURIComponent(route)}`)},[ready,user,route]);
  useEffect(() => { document.title = (isHome ? 'Every quote. A clearer decision.' : isAuth ? route === 'signup' ? 'Create your account' : route === 'login' ? 'Welcome back' : 'Reset your password' : tender ? `${tabNames[tab] || 'Workspace'} · ${tender.brief.title}` : route === 'tenders' ? 'My Tenders' : route === 'new' ? 'Create a tender' : route.startsWith('profile-') ? 'Your supplier portfolio' : 'Explore suppliers') + ' — QuoteLens'; }, [route, tender?.brief.title]);
  let page;
  if(!ready&&!isHome)page=<main className="wrap app-page"><p>Connecting your workspace…</p></main>;
  else if (isHome) page = <Landing/>;
  else if (isAuth) page = <Auth key={route} mode={route as 'login' | 'signup' | 'forgot-password'}/>;
  else if (route === 'tenders') page = <Tenders/>;
  else if (route === 'new') page = <NewTender/>;
  else if (route === 'suppliers') page = <SupplierDirectory/>;
  else if (parts[0] === 'supplier') page = <SupplierPortfolio key={id} id={id}/>;
  else if (parts[0] === 'profile-new' || parts[0] === 'profile-edit') page = <PortfolioForm key={id || 'new'} id={id}/>;
  else if (tender) page = <main className={`wrap app-page tender-workspace ${tab === 'compare' ? 'comparison-workspace' : ''}`}>
    <div className="workspace-crumb"><Link to="tenders">My Tenders</Link><ChevronRight size={12}/><span>{tabNames[tab] || 'Workspace'}</span>{tender.sample && <Badge tone="sample">Example tender</Badge>}<span className="local-badge"><LockKeyhole size={11}/> Saved to your account</span></div>
    <div className="workspace-heading"><div><h1>{tender.brief.title}</h1><p>{!tender.brief.general&&<span><FileText size={12}/>{tender.brief.quantity} units</span>}<span><MapPin size={12}/>{tender.brief.location}</span><span><CalendarDays size={12}/>{tender.brief.deadline?`Due ${date(tender.brief.deadline)}`:'No deadline set'}</span></p></div>{tab !== 'quotes' && <Link className="button secondary" to={path(id, 'quotes')}><Plus size={15}/> Add quotation</Link>}</div>
    <div className="workspace-content">{tab === 'brief' ? <TenderBrief key={id} id={id}/> : tab === 'quotes' ? <Quotations id={id}/> : tab === 'review' ? <QuotationReview key={`${id}/${parts[3]}`} id={id} offerId={parts[3]}/> : tab === 'compare' ? <Comparison id={id}/> : tab === 'drafts' ? <Drafts id={id} offerId={parts[3]}/> : tab === 'activity' ? <Activity id={id}/> : <Empty title="Choose a step in your workspace." description="Your brief, offers and decisions are all here."/>}</div>
  </main>;
  else page = <main className="wrap app-page"><Empty title="Let’s find the right page." description="This workspace isn’t available on this device."><Link className="button primary" to="tenders">Go to My Tenders</Link></Empty></main>;
  return <MotionConfig reducedMotion="user"><Context.Provider value={{ store, setStore, notify, go, user,refreshSession,logout,syncNow,acceptRemote,openInfo: () => setInfo(true) }}><div className={isHome ? 'ql-root ql-root-home' : 'ql-root ql-app'}>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); mainFocus.current?.focus(); }}>Skip to content</a>
    {!isHome && !isAuth && <header className="ql-app-header"><div className="ql-app-header-inner"><Logo/><nav aria-label="Main navigation" className={menu ? 'ql-app-nav is-open' : 'ql-app-nav'}><Link to="" onClick={() => setMenu(false)}>Home</Link><Link to="tenders" className={workspace || route === 'tenders' || route === 'new' ? 'active' : ''} aria-current={workspace || route === 'tenders' ? 'page' : undefined}>My Tenders</Link><Link to="suppliers" className={route.startsWith('supplier') || route.startsWith('profile') ? 'active' : ''}>Suppliers</Link></nav><div className="ql-app-header-actions"><button className="ql-help" onClick={() => setInfo(true)} aria-label="About your workspace"><CircleHelp size={18}/></button>{user?<button className="ql-app-login" onClick={()=>{logout().then(()=>go('')).catch(e=>notify(e.message))}}>Log out <ArrowUpRight size={13}/></button>:<Link to="login" className="ql-app-login">Log in <ArrowUpRight size={13}/></Link>}<button className="ql-app-menu" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={21}/> : <Menu size={21}/>}</button></div></div></header>}
    <div className={workspace ? 'ql-workspace-layout' : ''}>{workspace && tender && <WorkspaceNav route={route} tender={tender}/>}<div className="ql-main">{syncError&&<div className="storage-error" role="alert">{syncError} {user&&<button onClick={()=>syncNow().catch(()=>{})}>Retry save</button>}</div>}{syncing&&<div className="sync-state" role="status">Saving to MongoDB…</div>}<div id="main-content" ref={mainFocus} tabIndex={-1}>{page}</div>{!isHome && !isAuth && <footer className="ql-app-footer wrap"><span>QuoteLens <i>·</i> A clearer view of every offer.</span><span><LockKeyhole size={11}/> Saved to your account</span></footer>}</div></div>
    {!isAuth && <Lumi tender={tender} route={route}/>}
    <AnimatePresence>{toast && <motion.div className="toast" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} role="status"><Check size={16}/>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={14}/></button></motion.div>}</AnimatePresence>
    {info && <Modal title="Your workspace, made clear." onClose={() => setInfo(false)}><p className="modal-lead">Your brief, your offers, your next decision.</p><div className="integration-list"><div><Badge tone="green">Available now</Badge><p>Create tenders, review quotations, compare costs and requirements, explore portfolios, and save editable message drafts.</p></div><div><Badge>Saved to your account</Badge><p>Your work and original documents are stored in your MongoDB account. Example tender and portfolio content is illustrative. Verify supplier credentials and source figures before purchasing.</p></div><div><Badge tone="amber">Review before sending</Badge><p>Gemma reads quotation page images and produces editable Markdown. Review extraction against the source. Comparison and Lumi use your saved tender evidence. Message delivery is not connected; review and send drafts through your email app.</p></div></div><Button onClick={() => setInfo(false)}>Back to my workspace <ArrowRightIcon/></Button></Modal>}
  </div></Context.Provider></MotionConfig>;
}
function ArrowRightIcon() { return <ArrowUpRight size={15}/>; }
