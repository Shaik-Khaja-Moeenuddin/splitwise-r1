import { useMemo, useState } from "react";

const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

function calculateGroupBalances(group, expenses, settlements, users) {
  if (!group) return { balances: [], transfers: [] };
  const net = Object.fromEntries(group.memberIds.map(id => [id, 0]));
  expenses.filter(e => e.groupId === group.id).forEach(expense => {
    const participants = (Array.isArray(expense.splitBetween) ? expense.splitBetween : group.memberIds).filter(id => id in net);
    if (!participants.length) return;
    const share = Number(expense.amount) / participants.length;
    participants.forEach(id => { net[id] -= share; });
    if (expense.paidBy in net) net[expense.paidBy] += Number(expense.amount);
  });
  settlements.filter(s => s.groupId === group.id).forEach(s => {
    if (s.from in net && s.to in net) { net[s.from] += Number(s.amount); net[s.to] -= Number(s.amount); }
  });
  const balances = group.memberIds.map(id => ({ id, name: users.find(u => u.id === id)?.name || "Member", amount: net[id] }));
  const debtors = balances.filter(b => b.amount < -0.005).map(b => ({ ...b, remaining: -b.amount }));
  const creditors = balances.filter(b => b.amount > 0.005).map(b => ({ ...b, remaining: b.amount }));
  const transfers = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].remaining, creditors[j].remaining);
    if (amount > 0.005) transfers.push({ from: debtors[i].name, to: creditors[j].name, amount });
    debtors[i].remaining -= amount; creditors[j].remaining -= amount;
    if (debtors[i].remaining < 0.005) i++;
    if (creditors[j].remaining < 0.005) j++;
  }
  return { balances, transfers };
}

export default function Settlements({ user, users, groups, expenses = [], settlements, addSettlement }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || "");
  const [from, setFrom] = useState(user.id);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const group = groups.find(g => g.id === groupId);
  const members = group ? users.filter(u => group.memberIds.includes(u.id)) : [];
  const summary = useMemo(() => calculateGroupBalances(group, expenses, settlements, users), [group, expenses, settlements, users]);
  const submit = e => {
    e.preventDefault();
    const result = addSettlement({ groupId, from, to, amount, note });
    if (result) { setError(result); setSuccess(""); return; }
    setError(""); setSuccess("Settlement recorded and balances updated."); setAmount(""); setNote("");
  };
  const onGroupChange = value => { setGroupId(value); setFrom(user.id); setTo(""); };
  return <>
    <div className="welcome-row"><div><div className="eyebrow">CLOSE THE LOOP</div><h2>Balances & settlements</h2><p className="muted">See each member's share and record repayments between group members.</p></div></div>
    <section className="surface-card balance-panel">
      <div className="section-heading"><div><h3>Group balance summary</h3><p>Positive means the member should receive money; negative means they owe money.</p></div></div>
      <label className="balance-group-select">Select group<select className="form-select" value={groupId} onChange={e => onGroupChange(e.target.value)}><option value="">Choose a group</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      {!group ? <div className="empty-state compact"><i className="bi bi-calculator"/><strong>No group selected</strong><span>Create or select a group to calculate balances.</span></div> : <>
        <div className="balance-list">{summary.balances.map(b => <div className="balance-row" key={b.id}><div className="avatar avatar-small">{b.name[0]?.toUpperCase()}</div><strong>{b.name}{b.id === user.id ? " (you)" : ""}</strong><span className={b.amount > 0.005 ? "balance-positive" : b.amount < -0.005 ? "balance-negative" : "balance-even"}>{Math.abs(b.amount) < 0.005 ? "Settled up" : `${b.amount > 0 ? "Gets back " : "Owes "}${money(Math.abs(b.amount))}`}</span></div>)}</div>
        <div className="suggested-settlements"><h4>Suggested payments</h4>{summary.transfers.length ? summary.transfers.map((t,i)=><div className="suggestion-row" key={`${t.from}-${t.to}-${i}`}><span><strong>{t.from}</strong> pays <strong>{t.to}</strong></span><strong className="amount">{money(t.amount)}</strong></div>) : <p className="muted small mb-0">Everyone is settled up in this group.</p>}</div>
      </>}
    </section>
    <div className="two-column-layout mt-3">
      <section className="surface-card"><div className="section-heading"><div><h3>Record a payment</h3><p>Record money already paid back by one member to another.</p></div></div>
        {error && <div className="alert alert-danger">{error}</div>}{success && <div className="alert alert-success">{success}</div>}
        <form className="app-form" onSubmit={submit}>
          <label>Group<select className="form-select" value={groupId} onChange={e=>onGroupChange(e.target.value)} required><option value="">Choose a group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label>Paid by<select className="form-select" value={from} onChange={e=>setFrom(e.target.value)} required><option value="">Choose member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>Paid to<select className="form-select" value={to} onChange={e=>setTo(e.target.value)} required><option value="">Choose recipient</option>{members.filter(m=>m.id!==from).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>Amount (₹)<input className="form-control" type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required /></label>
          <label>Note <span className="muted">(optional)</span><input className="form-control" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Hotel bill repayment" /></label>
          <button className="btn btn-brand" type="submit" disabled={!group}>Record settlement</button>
        </form>
      </section>
      <section className="surface-card"><div className="section-heading"><div><h3>Payment history</h3><p>Recorded repayments</p></div></div>
        {settlements.length ? <div className="expense-list">{[...settlements].reverse().map(s=><div className="expense-row" key={s.id}><div className="expense-icon success-icon"><i className="bi bi-check2"/></div><div className="expense-description"><strong>{users.find(u=>u.id===s.from)?.name || "Member"} paid {users.find(u=>u.id===s.to)?.name || "Member"}</strong><small>{groups.find(g=>g.id===s.groupId)?.name || "Legacy payment"} · {s.note || "Settlement"} · {new Date(s.date).toLocaleDateString()}</small></div><strong className="amount">{money(s.amount)}</strong></div>)}</div> : <div className="empty-state"><i className="bi bi-arrow-left-right"/><strong>No settlements yet</strong><span>Payments you record will appear here.</span></div>}
      </section>
    </div>
  </>;
}
