import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBoxes, FaArrowUp, FaArrowDown, FaSlidersH } from "react-icons/fa";
import { orderService, productService } from "../../services";
import { getMessage } from "../../services/api";
import { getImageUrl, formatDate } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const TYPE_LABEL = {
  restock: "Restock",
  deduct: "Deducted",
  adjust: "Adjusted",
  order: "Order",
  cancel: "Cancelled",
  sale: "Sale",
};

const AdminInventory = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      orderService.inventoryLogs(),
      productService.adminAll("published"),
    ])
      .then(([logsRes, prodRes]) => {
        setLogs(logsRes.data.logs || []);
        const products = prodRes.data.products || [];
        setLowStock(products.filter((p) => p.stock <= p.lowStockThreshold));
      })
      .catch(() => {
        setLogs([]);
        setLowStock([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const startAdjust = (p) => {
    setAdjusting(p);
    setAdjustQty(p.stock);
    setAdjustNote("");
  };

  const saveAdjust = async (e) => {
    e.preventDefault();
    if (adjusting == null || adjustQty === "") return;
    try {
      await productService.update(adjusting._id, {
        data: JSON.stringify({
          stock: Number(adjustQty),
          stockNote: adjustNote || "Manual stock adjustment",
        }),
      });
      showToast("Stock updated", "success");
      setAdjusting(null);
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <h1>Inventory</h1>
      <p className="dash-sub">Low stock alerts and stock movement history.</p>

      <div className="dash-panel">
        <div className="dash-panel-head">
          <h3><FaBoxes /> Low Stock Products</h3>
          <Link to="/admin/products">Manage Products →</Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="empty-text">All products are well stocked. 🎉</p>
        ) : (
          <div className="low-stock-list">
            {lowStock.map((p) => (
              <div className="low-stock-item" key={p._id}>
                <img src={getImageUrl(p.coverImage || p.images?.[0])} alt={p.name} />
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.stock} left (threshold {p.lowStockThreshold})</p>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => startAdjust(p)}>
                  <FaSlidersH /> Adjust
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dash-panel">
        <h3>Stock Movement Log</h3>
        {logs.length === 0 ? (
          <p className="empty-text">No stock movements yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Change</th>
                  <th>Stock After</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      <Link to={`/product/${log.product}`} className="inventory-product-link">
                        {log.productName}
                      </Link>
                    </td>
                    <td>
                      <span className={`inv-type inv-${log.changeType}`}>
                        {TYPE_LABEL[log.changeType] || log.changeType}
                      </span>
                    </td>
                    <td className={log.quantityChange < 0 ? "stock-low" : "stock-plus"}>
                      {log.quantityChange > 0 ? (
                        <><FaArrowUp /> +{log.quantityChange}</>
                      ) : (
                        <><FaArrowDown /> {log.quantityChange}</>
                      )}
                    </td>
                    <td>{log.stockAfter ?? "—"}</td>
                    <td>{log.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjusting && (
        <div className="modal-overlay" onClick={() => setAdjusting(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Adjust Stock</h3>
            <p className="modal-sub">{adjusting.name} (current: {adjusting.stock})</p>
            <form onSubmit={saveAdjust}>
              <div className="form-group">
                <label>New Stock Level *</label>
                <input
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Restocked after market"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setAdjusting(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
