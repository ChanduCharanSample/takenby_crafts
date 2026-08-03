import React, { useState, useEffect } from "react";
import { userService } from "../../services";
import { getMessage } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Spinner from "../../components/Spinner";

const AdminUsers = ({ role }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    userService
      .getAllUsers(role)
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const changeRole = async (id, newRole) => {
    try {
      await userService.updateUser(id, { role: newRole });
      showToast("Role updated", "success");
      load();
    } catch (err) {
      showToast(getMessage(err, "Update failed"), "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user and their data?")) return;
    try {
      await userService.deleteUser(id);
      showToast("User deleted", "info");
      load();
    } catch (err) {
      showToast(getMessage(err, "Delete failed"), "error");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dash-content">
      <h1>Manage Users</h1>
      <p className="dash-sub">
        Manage all customer accounts.
      </p>

      {users.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">👤</p>
          <h3>No users found</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="table-product">
                      <div className="account-avatar small">
                        {u.firstName?.charAt(0)}
                      </div>
                      <div>
                        <strong>{u.firstName} {u.lastName}</strong>
                        <span className="order-date">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {u.email}
                    <br />
                    {u.phone}
                  </td>
                  <td>{u.address?.city ? `${u.address.city}, ${u.address.state}` : "—"}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="role-select"
                    >
                      <option value="customer">customer</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(u._id)}
                      title="Delete user"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
