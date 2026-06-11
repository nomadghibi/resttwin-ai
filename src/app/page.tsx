import { auth } from '@/auth';
import Link from 'next/link';

const VALUE_CARDS = [
  {
    icon: '📊',
    title: 'Simulate operations',
    body: 'Run a 7-day digital twin of your restaurant. See demand, revenue, food cost, and labor cost estimates before you change anything.',
  },
  {
    icon: '💰',
    title: 'Optimize profit',
    body: 'Compare what-if scenarios side by side. Know the exact profit impact of a price change, extra staff, or a new delivery channel.',
  },
  {
    icon: '🤖',
    title: 'Get AI recommendations',
    body: 'Specialized agents analyze your menu, staffing, and operations. You get a clear decision — Recommended, Test First, or Not Recommended.',
  },
];

const USE_CASES = [
  { label: 'Raise prices 8%', q: 'Will higher prices cover the demand drop?' },
  { label: 'Open Monday', q: 'Does the extra revenue cover the labor cost?' },
  { label: 'Add delivery', q: 'Does 15% more orders offset the platform fee?' },
  { label: 'Cut lunch staffing', q: 'Is Tuesday lunch actually profitable?' },
  { label: 'Run a promotion', q: 'Does a 20% demand boost pay for the discount?' },
];

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <span className="text-lg font-bold text-gray-900">RestTwin AI</span>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600 mb-8">
          Agentic restaurant decision intelligence
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Test restaurant decisions
          <br />
          <span className="text-gray-400">before you risk real money.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          RestTwin AI builds a digital twin of your restaurant, runs operational simulations,
          and uses AI agents to explain what will actually happen before you act.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Sign in with demo account
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Demo: demo@resttwin.ai / demo1234
        </p>
      </section>

      {/* Value cards */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {VALUE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-6"
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-4xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Answer the questions that keep you up at night
        </h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          Run any what-if scenario in seconds. No spreadsheets. No guessing.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc) => (
            <div
              key={uc.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">{uc.label}</p>
              <p className="text-xs text-gray-500">{uc.q}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-4 text-center">
            {[
              { step: '1', title: 'Set up your twin', body: 'Enter menu, staff, hours, and costs once.' },
              { step: '2', title: 'Run baseline', body: '7-day simulation of current operations.' },
              { step: '3', title: 'Create scenario', body: 'Change one variable. See the impact.' },
              { step: '4', title: 'Get recommendation', body: 'AI agents review and advise. You decide.' },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-10 h-10 rounded-full bg-white text-gray-900 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <p className="text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-xs text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to test your next decision?
        </h2>
        <p className="text-gray-500 mb-8 text-sm">
          Free to use. No credit card. Takes 5 minutes to set up your restaurant twin.
        </p>
        <Link
          href="/register"
          className="rounded-lg bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Create free account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center text-xs text-gray-400">
        RestTwin AI · Estimates only, not financial guarantees.
      </footer>
    </div>
  );
}
