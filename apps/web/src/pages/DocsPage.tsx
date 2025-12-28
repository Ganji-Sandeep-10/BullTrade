import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BullTrade_logo from "@/assets/BullTrade_logo_gradientBlack.png";
import BullTradeIcon from "@/assets/bull-finance-icon.png";
import { ArrowUpRight } from "lucide-react";

const DocsPage = () => {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Navigation */}
      <nav className="px-6 lg:px-12 py-4 bg-white bg-opacity-95 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-end gap-1">
              <img src={BullTradeIcon} alt="BullTradeIcon" className="h-9" />
              <img src={BullTrade_logo} alt="BullTrade_logo" className="h-8" />
            </div>

            {/* Center Nav – unchanged */}
            <div className="landing-heading hidden md:flex items-center gap-2 md:-translate-x-14 transform">
              <Link
                to="/"
                className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors border border-black"
              >
                Home
              </Link>
              <Link
                to="/docs"
                className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors border border-black"
              >
                Documentation
              </Link>
              <Link
                to="/trade"
                className="text-black text-sm font-bold hover:bg-black hover:text-white px-3 py-1 rounded-full transition-colors border border-black"
              >
                Trade
              </Link>
            </div>

            <Button
              asChild
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm font-medium rounded-full flex items-center gap-2 border border-black"
            >
              <Link to="/signin">
                Sign up <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="text-6xl font-bold mb-6" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
            BullTrade Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BullTrade is a production-inspired cryptocurrency trading simulation
            designed to explain, step by step, how real exchanges structure
            execution engines, state management, and real-time market data flow.
          </p>
        </div>

        <div className="grid gap-8">
          {/* How BullTrade Is Different */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              How BullTrade Is Different
            </h2>
            <p className="text-gray-700 text-lg mb-4">
              Most trading demos stop at the user interface. They mock price feeds,
              shortcut execution logic, and treat the backend as a simple CRUD layer.
              BullTrade intentionally avoids that approach.
            </p>
            <p className="text-gray-700 mb-4">
              In BullTrade, the <b>trading engine is the center of the system</b>.
              The UI does not update balances, positions, or P&L on its own.
              Instead, it reacts to outcomes produced by the engine after
              deterministic execution.
            </p>
            <p className="text-gray-700 mb-4">
              This mirrors how professional exchanges work, where correctness,
              ordering, and recoverability matter far more than UI immediacy.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Engine-first architecture where logic lives outside the API</li>
              <li>• Trade execution modeled as immutable commands</li>
              <li>• Full replayability for debugging and crash recovery</li>
              <li>• Clear separation between visualization and execution pricing</li>
            </ul>
          </Card>

          {/* Architecture Overview */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              Architecture Overview
            </h2>
            <p className="text-gray-700 mb-6 text-lg">
              BullTrade is built as a collection of focused services that communicate
              using Redis Streams and Pub/Sub. Each service has a single responsibility
              and can be reasoned about independently.
            </p>
            <p className="text-gray-700 mb-4">
              This design ensures that market data ingestion, trade execution,
              API handling, and UI rendering do not interfere with each other.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>
                • <strong>Pooler:</strong> Maintains a persistent WebSocket connection
                to Backpack Exchange, batches and deduplicates ticks, and publishes
                them to Redis Streams
              </li>
              <li>
                • <strong>Engine:</strong> Consumes commands sequentially, updates
                in-memory state, and guarantees deterministic trade outcomes
              </li>
              <li>
                • <strong>API:</strong> Handles authentication, validation, and acts
                as a bridge between clients and the engine
              </li>
              <li>
                • <strong>MongoDB:</strong> Stores periodic snapshots of engine state
                to enable fast recovery
              </li>
            </ul>
          </Card>

          {/* Trade Execution Model */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              Trade Execution Model
            </h2>
            <p className="text-gray-700 mb-4">
              BullTrade does not execute trades synchronously inside HTTP request
              handlers. Doing so would introduce race conditions and make failures
              difficult to debug.
            </p>
            <p className="text-gray-700 mb-4">
              Instead, every trade is represented as a <b>command</b> that is written
              to Redis Streams and processed by the engine in strict order.
            </p>
            <ol className="list-decimal ml-6 space-y-2 text-gray-700">
              <li>User submits a trade request from the UI</li>
              <li>API validates inputs and authorization</li>
              <li>Validated command is appended to Redis Streams</li>
              <li>Engine consumes commands sequentially</li>
              <li>Positions, balances, and P&L are updated in memory</li>
              <li>Engine publishes an acknowledgement</li>
              <li>API returns the final result to the client</li>
            </ol>
            <p className="mt-4 text-gray-600">
              This approach guarantees ordering, prevents double execution, and
              allows the entire system to be replayed deterministically.
            </p>
          </Card>

          {/* Engine State & Recovery */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              Engine State & Recovery
            </h2>
            <p className="text-gray-700 mb-4">
              For performance reasons, the engine keeps all active positions,
              balances, and open orders fully in memory. This enables extremely
              fast execution and P&L updates.
            </p>
            <p className="text-gray-700 mb-4">
              To ensure durability, the engine periodically snapshots its state
              to MongoDB and uses Redis Streams as the authoritative event log.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• In-memory execution for low latency</li>
              <li>• MongoDB snapshots every 15 seconds</li>
              <li>• Redis Streams as the single source of truth</li>
              <li>• Restart flow: load snapshot → replay events → resume</li>
            </ul>
          </Card>

          {/* API Surface */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              API Surface
            </h2>
            <p className="text-gray-700 mb-4">
              The REST API is intentionally thin. Its job is not to execute business
              logic, but to authenticate users, validate requests, and forward
              commands to the engine.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
              <div>POST /auth/signup</div>
              <div>POST /auth/signin</div>
              <div>POST /trade/create-order</div>
              <div>POST /trade/close-order</div>
              <div>GET /trade/get-open-orders</div>
              <div>GET /trade/get-close-orders</div>
              <div>GET /balance/me</div>
            </div>
          </Card>

          {/* Non Goals */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              Explicit Non-Goals
            </h2>
            <p className="text-gray-700 mb-4">
              BullTrade deliberately avoids certain features to keep the system
              understandable and focused on architectural learning.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• No real money or live trading</li>
              <li>• No liquidation engine (yet)</li>
              <li>• No real user matching</li>
              <li>• No regulatory or custody guarantees</li>
            </ul>
          </Card>

          {/* Performance Metrics – unchanged */}
          <Card className="p-8 border-2 border-gray-200 rounded-3xl">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
              Performance Metrics
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-black mb-2">~200</div>
                <p className="text-gray-600">Orders / Second</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2">100ms</div>
                <p className="text-gray-600">Price Update Interval</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-black mb-2">35ms</div>
                <p className="text-gray-600">Avg Order Latency</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16 p-12 bg-black rounded-3xl text-center text-white">
          <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: "Halo Grotesk, sans-serif" }}>
            Ready to Explore Exchange Architecture?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            BullTrade is built for engineers who want a practical, hands-on
            understanding of how real trading systems operate internally.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-12 py-7 text-base font-semibold bg-white text-black hover:bg-gray-100"
          >
            <Link to="/signin">Create Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
