import { useState, useMemo } from "react";
import { Calculator, IndianRupee, Percent, Calendar, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/mockData";

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const result = useMemo(() => {
    const principal = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const months = tenure * 12;
    if (monthlyRate === 0) return { emi: principal / months, totalInterest: 0, totalPayment: principal };
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;
    return { emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment) };
  }, [loanAmount, interestRate, tenure]);

  const principalPercent = Math.round((loanAmount / result.totalPayment) * 100);
  const interestPercent = 100 - principalPercent;

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-3">
          <Calculator className="h-4 w-4" />
          Financial Tool
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">EMI Calculator</h1>
        <p className="text-muted-foreground mt-1">Calculate your monthly home loan EMI and plan your finances.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-card">
          {/* Loan Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-primary" /> Loan Amount
              </label>
              <span className="text-sm font-semibold text-primary">{formatPrice(loanAmount)}</span>
            </div>
            <Slider
              value={[loanAmount]}
              onValueChange={([v]) => setLoanAmount(v)}
              min={500000}
              max={50000000}
              step={100000}
              className="mb-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>₹5L</span><span>₹5Cr</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Percent className="h-4 w-4 text-primary" /> Interest Rate (%)
              </label>
              <span className="text-sm font-semibold text-primary">{interestRate}%</span>
            </div>
            <Slider
              value={[interestRate * 10]}
              onValueChange={([v]) => setInterestRate(v / 10)}
              min={50}
              max={200}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5%</span><span>20%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" /> Loan Tenure
              </label>
              <span className="text-sm font-semibold text-primary">{tenure} years</span>
            </div>
            <Slider
              value={[tenure]}
              onValueChange={([v]) => setTenure(v)}
              min={1}
              max={30}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 yr</span><span>30 yrs</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-primary p-6 text-primary-foreground shadow-card">
            <p className="text-sm opacity-80">Your Monthly EMI</p>
            <p className="font-display text-4xl font-bold mt-1">{formatPrice(result.emi)}</p>
            <p className="text-xs opacity-60 mt-1">per month for {tenure} years</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            {/* Visual bar */}
            <div className="flex rounded-full overflow-hidden h-4">
              <div className="bg-primary" style={{ width: `${principalPercent}%` }} />
              <div className="bg-accent" style={{ width: `${interestPercent}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Principal</p>
                  <p className="text-sm font-semibold">{formatPrice(loanAmount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="text-sm font-semibold">{formatPrice(result.totalInterest)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Payment</p>
                <p className="font-display text-lg font-bold text-foreground">{formatPrice(result.totalPayment)}</p>
              </div>
            </div>
          </div>

          {/* Affordability tip */}
          <div className="rounded-xl border bg-success/5 p-4 shadow-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-1">💡 Affordability Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your EMI should ideally not exceed 40% of your monthly income. 
              For this EMI of {formatPrice(result.emi)}/month, your ideal monthly income should be at least {formatPrice(Math.round(result.emi / 0.4))}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;
