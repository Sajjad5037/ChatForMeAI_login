import "./BuyUsageModal.css";

export default function BuyUsageModal({ onClose, onBuy }) {
  const plans = [
    { id: "basic", price: 5, tokens: "500,000" },
    { id: "pro", price: 10, tokens: "1,200,000" },
    { id: "business", price: 25, tokens: "3,500,000" },
  ];
 
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Buy Usage Tokens</h3>

        {plans.map(plan => (
          <div key={plan.id} className="plan-card">
            <div>
              <strong>{plan.tokens}</strong> tokens
            </div>
            <div>${plan.price}</div>

            <button
              className="btn primary"
              onClick={() => onBuy(plan)}
            >
              Buy
            </button>
          </div>
        ))}

        <button className="btn ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
