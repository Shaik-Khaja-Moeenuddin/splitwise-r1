import { useMemo, useState } from "react";
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value || 0);
export default function Admin({ users, allGroups = [], allExpenses = [], allSettlements = [], deleteGroup, deleteUser, updateUserRole, currentUser }) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const total = allExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const filteredUsers = useMemo(() => users.filter(u => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())), [users, query]);
  const exportCsv = () => {
    const rows = [["Name", "Email", "Role"], ...users.map(u => [u.name, u.email, u.role])];
    const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "splitwise-users.csv"; a.click(); URL.revokeObjectURL(url);
  };
  const removeGroup = group => { if (window.confirm(`Delete group “${group.name}” and its expenses/settlements?`)) { deleteGroup(group.id); setNotice(`Group “${group.name}” deleted.`); } };
  const removeUser = person => { if (window.confirm(`Delete ${person.name}? Related memberships, expenses and settlements will also be removed.`)) { deleteUser(person.id); setNotice(`${person.name} deleted.`); } };
  return <>
    <div className="welcome-row"><div><div className="eyebrow">ADMINISTRATION</div><h2>System management</h2><p className="muted">Monitor activity and manage demo accounts and groups.</p></div><span className="admin-badge"><i className="bi bi-shield-check me-1"/> Administrator</span></div>
    {notice && <div className="alert alert-success" role="status">{notice}</div>}
    <div className="stats-grid">
      <div className="stat-card"><div className="stat-icon"><i className="bi bi-people"/></div><div className="stat-label">REGISTERED USERS</div><div className="stat-value">{users.length}</div></div>
      <div className="stat-card"><div className="stat-icon blue"><i className="bi bi-collection"/></div><div className="stat-label">TOTAL GROUPS</div><div className="stat-value">{allGroups.length}</div></div>
      <div className="stat-card"><div className="stat-icon orange"><i className="bi bi-wallet2"/></div><div className="stat-label">TOTAL EXPENSES</div><div className="stat-value">{money(total)}</div></div>
      <div className="stat-card"><div className="stat-icon purple"><i className="bi bi-check2-circle"/></div><div className="stat-label">SETTLEMENTS</div><div className="stat-value">{allSettlements.length}</div></div>
    </div>
    <section className="surface-card mt-4"><div className="section-heading"><div><h3>User management</h3><p>Search accounts, change roles, export the list or remove demo accounts.</p></div><button className="btn btn-outline-brand btn-sm" onClick={exportCsv}><i className="bi bi-download me-1"/>Export CSV</button></div>
      <input className="form-control mb-3" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name, email or role" aria-label="Search users"/>
      <div className="table-responsive"><table className="table app-table align-middle"><thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>ACTIONS</th></tr></thead><tbody>{filteredUsers.map(person=><tr key={person.id}><td><strong>{person.name}</strong></td><td>{person.email}</td><td><span className={`role-pill ${person.role}`}>{person.role}</span></td><td><div className="d-flex gap-2 flex-wrap">{person.id !== "demo-admin" && person.id !== currentUser?.id && <><select className="form-select form-select-sm" style={{width: "112px"}} value={person.role} onChange={e=>updateUserRole(person.id,e.target.value)} aria-label={`Role for ${person.name}`}><option value="user">User</option><option value="admin">Admin</option></select><button className="btn btn-sm btn-outline-danger" onClick={()=>removeUser(person)}><i className="bi bi-trash"/> Delete</button></>}</div></td></tr>)}</tbody></table></div>
      {!filteredUsers.length && <p className="muted mb-0">No users match your search.</p>}
    </section>
    <section className="surface-card mt-4"><div className="section-heading"><div><h3>Group management</h3><p>Review and remove groups. Deleting a group also deletes its related expense and settlement records.</p></div></div>
      {allGroups.length ? <div className="table-responsive"><table className="table app-table align-middle"><thead><tr><th>GROUP</th><th>MEMBERS</th><th>EXPENSES</th><th>ACTIONS</th></tr></thead><tbody>{allGroups.map(g=><tr key={g.id}><td><strong>{g.name}</strong></td><td>{g.memberIds.length}</td><td>{allExpenses.filter(e=>e.groupId===g.id).length}</td><td><button className="btn btn-sm btn-outline-danger" onClick={()=>removeGroup(g)}><i className="bi bi-trash me-1"/>Delete group</button></td></tr>)}</tbody></table></div> : <p className="muted mb-0">No groups created yet.</p>}
    </section>
    <section className="surface-card mt-4"><div className="section-heading"><div><h3>Recent expense activity</h3><p>Latest transactions across all groups</p></div></div>{allExpenses.length ? <div className="table-responsive"><table className="table app-table align-middle"><thead><tr><th>DESCRIPTION</th><th>GROUP</th><th>AMOUNT</th><th>DATE</th></tr></thead><tbody>{[...allExpenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8).map(e=><tr key={e.id}><td>{e.description}</td><td>{allGroups.find(g=>g.id===e.groupId)?.name || "Deleted group"}</td><td>{money(e.amount)}</td><td>{e.date ? new Date(e.date).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div> : <p className="muted mb-0">No expenses recorded yet.</p>}</section>
  </>;
}
