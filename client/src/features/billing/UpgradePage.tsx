import { PLANS } from "./plans.config";
import { upgradePlanApi } from "./billing.api";
import { useToast } from "../../components/ToastProvider";

export default function UpgradePage() {
    const { showToast } = useToast();

    async function handleUpgrade(planName: string) {
        try {
            const res = await upgradePlanApi(planName);
            showToast({ type: "success", message: res.message });
        } catch (err: any) {
            showToast({ type: "error", message: err.message || "Upgrade failed" });
        }
    }

    return (
        <div className="p-6 text-slate-200">
            <h2 className="text-xl font-semibold mb-4">Choose your plan</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {Object.entries(PLANS).map(([key, plan]) => (
                    <div
                        key={key}
                        className="border border-slate-700 rounded-xl p-4 bg-slate-900"
                    >
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                        <p className="text-slate-400">{plan.monthlyCredits} credits / month</p>

                        <p className="text-xl mt-2">
                            ₹{plan.price}
                            <span className="text-sm text-slate-400">/month</span>
                        </p>

                        <ul className="mt-3 text-xs text-slate-300 space-y-1">
                            {plan.features.map((f, i) => (
                                <li key={i}>• {f}</li>
                            ))}
                        </ul>

                        <button
                            className="mt-4 w-full bg-sky-600 py-1.5 rounded-md text-sm font-semibold hover:bg-sky-500"
                            onClick={() => handleUpgrade(key)}
                        >
                            Upgrade
                        </button>
                    </div>
                ))}

            </div>
        </div>
    );
}
