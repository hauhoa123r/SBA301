import { ContactInbox } from "@/features/feedback/ContactInbox";
import { ManagementShell } from "./ManagementShell";
import "./feedbackAdmin.css";

export function FeedbackManagementPage() {
  return <ManagementShell title="Feedback người dùng"><ContactInbox /></ManagementShell>;
}
