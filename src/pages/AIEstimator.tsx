import { Brain, BarChart3, TrendingUp, Zap } from "lucide-react";
import AIEstimatorWidget from "@/components/AIEstimatorWidget";

const AIEstimator = () => {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-ai/10 px-4 py-1.5 text-sm font-medium text-ai">
          <Zap className="h-4 w-4" />
          AI-Powered Analytics
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">
          Property Price <span className="text-gradient-accent">Estimator</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Get instant AI-driven property valuations based on real market data, location analytics, and comparable transactions.
        </p>
      </div>

      <div className="mx-auto max-w-2xl mb-16">
        <AIEstimatorWidget />
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">How Our AI Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: "Market Analysis",
              desc: "Our AI analyzes thousands of recent transactions in your area to establish accurate price benchmarks.",
            },
            {
              icon: Brain,
              title: "ML Prediction",
              desc: "Machine learning models consider 50+ factors including location, amenities, market trends, and seasonality.",
            },
            {
              icon: TrendingUp,
              title: "Price Trends",
              desc: "Historical price trajectory and growth patterns help predict future property values with high accuracy.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ai/10">
                <f.icon className="h-6 w-6 text-ai" />
              </div>
              <h3 className="font-display text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIEstimator;
