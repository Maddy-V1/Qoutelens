import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './classic-final.css';
import './landing-redesign.css';
import './framer-refinement.css';
import './product-theme.css';
class ErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<main className="wrap app-page"><div className="empty"><span className="empty-symbol">↗</span><h1>Let’s get you back to a clearer view.</h1><p>This screen could not load. Your saved browser data has not been removed.</p><div className="actions"><button className="button primary" onClick={()=>location.reload()}>Reload QuoteLens</button></div></div></main>:this.props.children}}
createRoot(document.getElementById('root')!).render(<React.StrictMode><ErrorBoundary><App/></ErrorBoundary></React.StrictMode>);
