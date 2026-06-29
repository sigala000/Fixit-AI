import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Shield, Compass, Sparkles, DollarSign, Brain, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]"></div>

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500 rounded-xl text-white">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-wider uppercase">FIXIT AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Sign In</Link>
          <Link to="/register" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand-600/30">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-brand-400 mb-8 animate-bounce">
          <Sparkles className="w-4 h-4" />
          Kaggle AI Agents Capstone Project
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          AI-Powered Artisan Matching <br />
          <span className="bg-gradient-to-r from-brand-500 to-indigo-400 bg-clip-text text-transparent">&amp; Repair Management</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-12">
          An intelligent platform matching African homes and businesses with certified local artisans, featuring automated diagnostics, pricing quotes, and conflict-free scheduling.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-base font-bold rounded-xl flex items-center justify-center gap-2 group transition-all shadow-xl shadow-brand-600/20">
            Create Free Account
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
            Dashboard Demo
          </Link>
        </div>
      </header>

      {/* Problem & Solution Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Bridging the Artisan Access Gap</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Empowering households and businesses across Cameroon with transparent repair services.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-900 flex flex-col gap-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl w-fit">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Describe Simply</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Customers explain issues in plain language or upload photos. Our Intake Agent parses symptoms immediately.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-900 flex flex-col gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Proximity Matching</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The Matching Agent calculates geographic coordinates and ranks available artisans by rating and proximity.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-900 flex flex-col gap-4">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl w-fit">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-xl">Fair Pricing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automatic quotation calculations provide labor, parts, and travel estimates, eliminating unfair price gouging.
            </p>
          </div>
        </div>
      </section>

      {/* Multi-Agent Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900 bg-slate-950/40 rounded-3xl mb-24 border">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Multi-Agent System &amp; MCP Integration</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Powered by Google ADK (Agent Development Kit) &amp; Model Context Protocol.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500 flex items-center justify-center font-bold text-brand-400 shrink-0">1</div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-white">Intake &amp; Diagnosis Agent</h4>
                <p className="text-slate-400 text-sm">Understands issues, identifies category, and gauges urgency levels.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500 flex items-center justify-center font-bold text-brand-400 shrink-0">2</div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-white">Matching &amp; Estimation Agent</h4>
                <p className="text-slate-400 text-sm">Pulls available artisans and generates exact price quotes using custom MCP tools.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500 flex items-center justify-center font-bold text-brand-400 shrink-0">3</div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-white">Scheduling &amp; Support Agent</h4>
                <p className="text-slate-400 text-sm">Saves bookings, avoids technician scheduling conflicts, and alerts customers.</p>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-500" />
              Local Cameroon Market Seed Data
            </h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-center justify-between py-2 border-b border-slate-800">
                <span>Total Seeded Technicians</span>
                <span className="font-bold text-white">50 Artisan Profiles</span>
              </li>
              <li className="flex items-center justify-between py-2 border-b border-slate-800">
                <span>Categories</span>
                <span className="font-bold text-white">10 Specialized Trades</span>
              </li>
              <li className="flex items-center justify-between py-2 border-b border-slate-800">
                <span>Cities Supported</span>
                <span className="font-bold text-white">Douala, Yaoundé, Bafoussam...</span>
              </li>
              <li className="flex items-center justify-between py-2">
                <span>Pre-loaded Historical Requests</span>
                <span className="font-bold text-white">100+ Requests</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} FIXIT AI AGENT. Built for the Kaggle Capstone Competition.</p>
      </footer>
    </div>
  );
}
