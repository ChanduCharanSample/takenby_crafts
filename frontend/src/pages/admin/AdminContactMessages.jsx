import React, { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaReply,
  FaArchive,
  FaTrash,
  FaEnvelopeOpen,
} from "react-icons/fa";
import { contactMessageService } from "../../services";
import { getMessage } from "../../services/api";
import { formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const STATUS_OPTIONS = ["Unread", "Read", "Replied", "Archived"];
const STATUS_COLORS = {
  Unread: "status-unread",
  Read: "status-read",
  Replied: "status-replied",
  Archived: "status-archived",
};

const AdminContactMessages = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewing, setViewing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback((q = query, f = filter, s = sort) => {
    setLoading(true);
    const params = {};
    if (q) params.search = q;
    if (f) params.status = f;
    if (s) params.sort = s;
    contactMessageService
      .adminAll(params)
      .then(({ data }) => {
        setMessages(data.messages || []);
        setCounts(data.counts || {});
      })
      .catch(() => {
        setMessages([]);
        setCounts({});
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load(query, filter, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter, sort]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const applyStatus = async (m, status) => {
    try {
      await contactMessageService.update(m._id, { status });
      showToast(`Marked as ${status}`, "success");
      load(query, filter, sort);
      if (viewing?._id === m._id) setViewing((v) => (v ? { ...v, status } : v));
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const openMessage = async (m) => {
    setViewing(m);
    if (m.status === "Unread") {
      try {
        await contactMessageService.update(m._id, { status: "Read" });
        setViewing({ ...m, status: "Read" });
        load(query, filter, sort);
      } catch {
        // non-critical; keep viewing
      }
    }
  };

  const handleDelete = async (m) => {
    try {
      await contactMessageService.remove(m._id);
      showToast("Message deleted", "success");
      setConfirmDelete(null);
      if (viewing?._id === m._id) setViewing(null);
      load(query, filter, sort);
    } catch (err) {
      showToast(getMessage(err, "Could not delete message"), "error");
    }
  };

  const exportCsv = () => {
    const rows = messages.map((m) => ({
      Name: m.name,
      Email: m.email,
      Phone: m.phone || "",
      Subject: m.subject || "",
      Message: m.message.replace(/\n/g, " "),
      Status: m.status,
      Received: formatDate(m.createdAt),
    }));
    const header = Object.keys(rows[0] || { Name: "", Email: "", Phone: "", Subject: "", Message: "", Status: "", Received: "" });
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [header.join(","), ...rows.map((r) => header.map((h) => escape(r[h])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = messages;

  return (
    <div className="dash-content">
      <h1>Contact Messages</h1>
      <p className="dash-sub">Messages submitted through the contact form.</p>

      <div className="dash-toolbar cm-toolbar">
        <div className="cm-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search name, email, subject or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s} ({counts[s] ?? 0})</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={exportCsv} title="Export visible rows to CSV">
          <FaDownload /> Export CSV
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">📬</p>
          <h3>No messages found</h3>
          <p>Messages from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._id} className={m.status === "Unread" ? "cm-row-unread" : ""}>
                  <td>
                    <div className="cm-from">
                      <strong>{m.name}</strong>
                      <a href={`mailto:${m.email}`}>{m.email}</a>
                      {m.phone && <span className="cm-phone">{m.phone}</span>}
                    </div>
                  </td>
                  <td>{m.subject || "—"}</td>
                  <td className="cm-preview" title={m.message}>
                    {m.message.length > 70 ? `${m.message.slice(0, 70)}…` : m.message}
                  </td>
                  <td>{formatDate(m.createdAt)}</td>
                  <td>
                    <span className={`cm-status ${STATUS_COLORS[m.status]}`}>
                      {m.status === "Unread" && <span className="cm-dot" />}
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div className="cm-actions">
                      <button className="icon-btn" title="View" onClick={() => openMessage(m)}>
                        <FaEye />
                      </button>
                      {m.status !== "Read" && (
                        <button className="icon-btn" title="Mark as read" onClick={() => applyStatus(m, "Read")}>
                          <FaEnvelopeOpen />
                        </button>
                      )}
                      {m.status !== "Replied" && (
                        <button className="icon-btn" title="Mark as replied" onClick={() => applyStatus(m, "Replied")}>
                          <FaReply />
                        </button>
                      )}
                      {m.status !== "Archived" && (
                        <button className="icon-btn" title="Archive" onClick={() => applyStatus(m, "Archived")}>
                          <FaArchive />
                        </button>
                      )}
                      <button className="icon-btn danger" title="Delete" onClick={() => setConfirmDelete(m)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal cm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{viewing.subject || "Message"}</h3>
            <p className="modal-sub">
              From <strong>{viewing.name}</strong> • {viewing.email}
              {viewing.phone && <> • {viewing.phone}</>} • {formatDate(viewing.createdAt)}
            </p>
            <span className={`cm-status ${STATUS_COLORS[viewing.status]}`}>{viewing.status}</span>
            <div className="cm-full-message">{viewing.message}</div>
            <div className="modal-actions">
              {viewing.status !== "Replied" && (
                <button className="btn btn-sm btn-primary" onClick={() => applyStatus(viewing, "Replied")}>
                  <FaCheckCircle /> Mark Replied
                </button>
              )}
              {viewing.status !== "Archived" && (
                <button className="btn btn-sm btn-outline" onClick={() => applyStatus(viewing, "Archived")}>
                  <FaArchive /> Archive
                </button>
              )}
              <button className="btn btn-sm btn-danger" onClick={() => { setConfirmDelete(viewing); setViewing(null); }}>
                <FaTrash /> Delete
              </button>
              <button className="btn btn-sm btn-outline" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal cm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete message?</h3>
            <p className="modal-sub">
              Delete the message from <strong>{confirmDelete.name}</strong> ({confirmDelete.email})? This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-sm btn-outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(confirmDelete)}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactMessages;
