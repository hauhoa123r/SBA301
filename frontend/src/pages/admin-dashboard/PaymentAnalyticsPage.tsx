import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminDialog, DateControls, Metric, ValueChart } from "@/features/admin-dashboard/analytics";
import { defaultDates, paymentLabels, type PaymentReport, type PaymentTransaction } from "@/features/admin-dashboard/analyticsModel";
import { dateTime, useAdminResource } from "@/features/admin-dashboard/management";
import { formatMoney } from "@/features/admin-dashboard/format";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

function TransactionDetail({ id, close }: { id: number; close: () => void }) {
  const resource = useAdminResource<PaymentTransaction>(`/api/admin/payments/${id}`); const t = resource.data;
  return <AdminDialog title={`Chi tiết giao dịch #${id}`} close={close}><ResourceStatus {...resource} retry={resource.refresh} />
    {t && <dl>{[["Mã giao dịch", t.transactionId], ["Hóa đơn", `INV-${t.invoiceId} · ${t.invoiceStatus}`], ["Học viên", `${t.student} · ${t.email}`],
      ["Sản phẩm", `${t.product} · ${t.productType}`], ["Số tiền giao dịch", formatMoney(t.amount)], ["Số tiền hóa đơn", formatMoney(t.invoiceAmount)],
      ["Hoàn tiền đã xử lý", formatMoney(t.refundedAmount)], ["Phương thức", t.method], ["Trạng thái", paymentLabels[t.status] ?? t.status],
      ["Xác nhận thanh toán", t.paymentTime ? dateTime(t.paymentTime) : "Chưa có thời điểm xác nhận"], ["Tạo giao dịch", dateTime(t.createdAt)]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
  </AdminDialog>;
}
export function PaymentAnalyticsPage() {
  const [dates, setDates] = useState(defaultDates); const [input, setInput] = useState(""); const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); const [page, setPage] = useState(0); const [selected, setSelected] = useState<number | null>(null);
  const [unknownOnly, setUnknownOnly] = useState(false);
  const query = new URLSearchParams({ from: dates.from, to: dates.to, mode: dates.mode, search, status, page: String(page), unknownOnly: String(unknownOnly) });
  const resource = useAdminResource<PaymentReport>(`/api/admin/payments?${query}`); const data = resource.data;
  function submit(e: FormEvent) { e.preventDefault(); setPage(0); setSearch(input.trim()); }
  return <ManagementShell title="Thống kê thanh toán">
    <DateControls value={dates} onChange={v => { setDates(v); setPage(0); }} />
    <ResourceStatus {...resource} retry={resource.refresh} />
    {data && <><div className="admin-cards">
      {[["Tổng doanh thu · toàn bộ", data.totalRevenue], ["Doanh thu tháng hiện tại", data.revenueThisMonth], ["Doanh thu trong khoảng", data.revenue],
        ["Hoàn tiền trong khoảng", data.refundedAmount], ["Doanh thu ròng trong khoảng", data.netRevenue]].map(([title, value]) => <section className="admin-card" key={String(title)}><h2>{title}</h2><strong className="admin-card-value">{value == null ? "Chưa xác định" : formatMoney(Number(value))}</strong></section>)}
      <Metric title="Thành công trong khoảng" value={data.successfulPayments} /><Metric title="Đang chờ trong khoảng" value={data.pendingPayments} />
      <Metric title="Thất bại / hủy / hết hạn" value={data.failedPayments} /><Metric title="Tổng giao dịch trong khoảng" value={data.totalTransactions} />
    </div>
      <p className="admin-note">{data.unknownPaymentTimes} giao dịch SUCCESS lịch sử thiếu thời điểm xác nhận, không nằm trong biểu đồ và danh sách theo ngày. Bật bộ lọc riêng bên dưới để tra cứu các giao dịch này.</p>
      <div className="admin-grid"><ValueChart title="Doanh thu theo thời gian" rows={data.trend.map(b => ({ label: b.label, value: b.amount }))} money />
        <ValueChart title="Giao dịch theo trạng thái" rows={Object.entries(paymentLabels).map(([s, label]) => ({ label, value: data.statuses.find(v => v.status === s)?.count ?? 0 }))} /></div>
      <section className="admin-panel"><h2>Doanh thu theo sản phẩm</h2><div className="admin-table-scroll"><table><thead><tr><th>Sản phẩm</th><th>Loại</th><th>Doanh thu</th></tr></thead><tbody>{data.products.map((p, i) => <tr key={`${p.type}-${p.courseId}-${i}`}><td>{p.name}</td><td>{p.type === "COURSE" ? "Mua khóa" : "Subscription"}</td><td>{formatMoney(p.revenue)}</td></tr>)}</tbody></table></div>{!data.products.length && <p className="admin-empty">Chưa có doanh thu trong khoảng chọn.</p>}</section>
    </>}
    <section className="admin-panel"><h2>Tra cứu giao dịch</h2><form className="admin-filters" onSubmit={submit}>
      <label>Tên, email, mã hoặc sản phẩm<input maxLength={200} value={input} onChange={e => setInput(e.target.value)} /></label>
      <label>Trạng thái<select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}><option value="">Tất cả</option>{Object.entries(paymentLabels).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label><button className="admin-button">Tìm kiếm</button>
      <label className="admin-check"><input type="checkbox" checked={unknownOnly} onChange={e => { setUnknownOnly(e.target.checked); setPage(0); setStatus(""); }} />Chỉ SUCCESS thiếu thời điểm (toàn bộ lịch sử)</label>
      <button type="button" className="admin-button" disabled={resource.loading} onClick={resource.refresh}>Làm mới</button></form>
      {data && <><div className="admin-table-scroll"><table><thead><tr><th>Transaction ID</th><th>Học viên</th><th>Khóa / Sản phẩm</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th><th>Thanh toán</th><th>Chi tiết</th></tr></thead><tbody>{data.content.map(t => <tr key={t.id}>
        <td>{t.transactionId}</td><td><Link to={`/admin/students/${t.studentId}`}>{t.student}</Link><small className="admin-secondary">{t.email}</small></td><td>{t.product}</td><td>{formatMoney(t.amount)}</td><td>{t.method}</td><td>{paymentLabels[t.status] ?? t.status}</td><td>{dateTime(t.paymentTime)}</td><td><button className="admin-text-button" onClick={() => setSelected(t.id)}>Xem</button></td>
      </tr>)}</tbody></table></div>{!data.content.length && <p className="admin-empty">Không tìm thấy giao dịch phù hợp.</p>}
        <div className="admin-pagination"><span>{data.totalElements} giao dịch · Trang {data.totalPages ? page + 1 : 0}/{data.totalPages}</span><div><button className="admin-button" disabled={!page} onClick={() => setPage(p => p - 1)}>Trước</button><button className="admin-button" disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)}>Sau</button></div></div></>}
    </section>
    {data?.notes.map(note => <p className="admin-note" key={note}>{note}</p>)}
    {selected !== null && <TransactionDetail id={selected} close={() => setSelected(null)} />}
  </ManagementShell>;
}
