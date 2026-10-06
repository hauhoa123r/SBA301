import { useState, type FormEvent } from "react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAdminResource, type Plan } from "@/features/admin-dashboard/management";
import { formatMoney } from "@/features/admin-dashboard/format";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

function PlanForm({ plan, onSaved, close }: { plan: Plan | null; onSaved: () => void; close: () => void }) {
  const [code, setCode] = useState(plan?.code ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(String(plan?.price ?? ""));
  const [days, setDays] = useState(String(plan?.durationDays ?? 30));
  const [active, setActive] = useState(plan?.active ?? true);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const body = { code, name: name.trim(), price: Number(price), durationDays: Number(days), active, reason };
      if (plan) await axiosClient.put(`/api/admin/subscription-plans/${plan.code}`, body);
      else await axiosClient.post("/api/admin/subscription-plans", body);
      onSaved();
    } catch (error) { setError(getApiErrorMessage(error)); }
    finally { setSaving(false); }
  }
  return <form className="admin-panel admin-management-form" onSubmit={event => { void submit(event); }}><h2>{plan ? `Chỉnh sửa ${plan.name}` : "Tạo gói học"}</h2>
    <fieldset disabled={saving}><div className="admin-filters">
      <label>Mã gói<input required pattern="[A-Z][A-Z0-9_]{1,29}" maxLength={30} value={code} disabled={!!plan} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="VD: QUARTERLY" /></label>
      <label>Tên gói<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} /></label>
      <label>Giá (VND)<input type="number" required min={code === "FREE_TRIAL" ? 0 : 1} max={9999999999999} step="1" value={price} disabled={code === "FREE_TRIAL"} onChange={event => setPrice(event.target.value)} /></label>
      <label>Thời hạn (ngày)<input type="number" required min={1} max={3650} step={1} value={days} onChange={event => setDays(event.target.value)} /></label>
      <label>Trạng thái<select value={active ? "ACTIVE" : "INACTIVE"} onChange={event => setActive(event.target.value === "ACTIVE")}><option value="ACTIVE">Đang cung cấp</option><option value="INACTIVE">Ngừng cung cấp</option></select></label>
    </div><label>Lý do<textarea required maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} /></label>
    <p className="admin-note">Giá và thời hạn mới áp dụng cho lần mua tiếp theo. Gói đã cấp và hóa đơn đã tạo giữ thời hạn/giá đã ghi nhận. Ngừng cung cấp không thu hồi quyền học hiện có.</p>
    <div className="admin-filters"><button className="admin-button">{saving ? "Đang lưu…" : "Lưu gói học"}</button><button type="button" className="admin-button" onClick={close}>Hủy</button></div></fieldset>
    {error && <p className="admin-error" role="alert">{error}</p>}
  </form>;
}
export function SubscriptionPlanManagementPage() {
  const resource = useAdminResource<Plan[]>("/api/admin/subscription-plans");
  const [selected, setSelected] = useState<Plan | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  return <ManagementShell title="Quản lý gói học">
    <div className="admin-filters"><button className="admin-button" onClick={() => { setSelected(null); setMessage(""); }}>Tạo gói mới</button>
      <button className="admin-button" disabled={resource.loading} onClick={resource.refresh}>Làm mới</button></div>
    {message && <p className="admin-success" role="status">{message}</p>}
    {selected !== undefined && <PlanForm key={selected?.code ?? "new"} plan={selected} close={() => setSelected(undefined)} onSaved={() => { setSelected(undefined); setMessage("Đã lưu gói học."); resource.refresh(); }} />}
    <ResourceStatus {...resource} retry={resource.refresh} />
    {resource.data && <section className="admin-panel"><div className="admin-table-scroll"><table><thead><tr><th>Mã / Tên</th><th>Giá</th><th>Thời hạn</th><th>Trạng thái</th><th /></tr></thead>
      <tbody>{resource.data.map(plan => <tr key={plan.code}><td><strong>{plan.name}</strong><small className="admin-secondary">{plan.code}</small></td><td>{formatMoney(plan.price)}</td><td>{plan.durationDays} ngày</td>
        <td>{plan.active ? "Đang cung cấp" : "Ngừng cung cấp"}</td><td><button className="admin-button" onClick={() => { setSelected(plan); setMessage(""); }}>Chỉnh sửa</button></td></tr>)}</tbody></table></div>
      {!resource.data.length && <p className="admin-empty">Chưa có gói học.</p>}</section>}
  </ManagementShell>;
}
