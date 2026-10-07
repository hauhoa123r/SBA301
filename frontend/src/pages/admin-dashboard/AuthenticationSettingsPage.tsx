import { useState, type FormEvent } from "react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

interface Policy { emailVerificationEnabled: boolean }
function SettingsForm({ policy, onSaved }: { policy: Policy; onSaved: () => void }) {
  const [enabled, setEnabled] = useState(policy.emailVerificationEnabled);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await axiosClient.put("/api/admin/auth-settings", { emailVerificationEnabled: enabled, reason });
      onSaved();
    } catch (error) { setError(getApiErrorMessage(error)); }
    finally { setSaving(false); }
  }
  return <form className="admin-panel admin-management-form" onSubmit={event => { void submit(event); }}>
    <h2>Xác minh email khi đăng ký</h2>
    <p className="admin-caption">Hiện tại: <strong>{policy.emailVerificationEnabled ? "Đang bật" : "Đang tắt"}</strong></p>
    <fieldset disabled={saving}><label className="admin-toggle"><input type="checkbox" checked={enabled} onChange={event => setEnabled(event.target.checked)} />
      Yêu cầu học viên xác minh email</label>
      <p className="admin-note">Khi bật, tài khoản mới cần kích hoạt qua email. Khi tắt, đăng ký không gửi email xác minh và tài khoản được kích hoạt ngay.</p>
      <p className="admin-note">Học viên đang chờ xác minh có thể đăng nhập bằng đúng mật khẩu để kích hoạt khi tùy chọn này tắt. Tài khoản bị khóa vẫn bị chặn. Bật lại không khóa các tài khoản đã kích hoạt.</p>
      <p className="admin-note">Email đặt lại mật khẩu vẫn được gửi. Khi tắt xác minh, hệ thống không kiểm tra người đăng ký có sở hữu địa chỉ email đó hay không.</p>
      <label>Lý do thay đổi<textarea required maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} /></label>
      <button className="admin-button mt-4" disabled={enabled === policy.emailVerificationEnabled}>{saving ? "Đang lưu…" : "Lưu cài đặt"}</button>
    </fieldset>
    {error && <p className="admin-error" role="alert">{error}</p>}
  </form>;
}
export function AuthenticationSettingsPage() {
  const resource = useAdminResource<Policy>("/api/admin/auth-settings");
  const [message, setMessage] = useState("");
  return <ManagementShell title="Cài đặt đăng ký">
    <ResourceStatus {...resource} retry={resource.refresh} />
    {message && <p className="admin-success" role="status">{message}</p>}
    {resource.data && <SettingsForm key={String(resource.data.emailVerificationEnabled)} policy={resource.data}
      onSaved={() => { setMessage("Đã lưu cài đặt xác minh email."); resource.refresh(); }} />}
  </ManagementShell>;
}
