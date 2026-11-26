import { STATUS_LABEL } from "../format.js";

export default function StatusBadge({ status }) {
  const key = (status || "PLACED").toUpperCase();
  return <span className={`status status-${key.toLowerCase()}`}>{STATUS_LABEL[key] || key}</span>;
}
