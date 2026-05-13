import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const STATUS_OPTIONS = ["Pending", "In Transit", "Delivered"];
const STATUS_NEXT = {
  Pending: "In Transit",
  "In Transit": "Delivered",
  Delivered: null,
};

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [shipments, setShipments] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    destination: "",
    start_date: "",
    end_date: "",
  });
  const [createForm, setCreateForm] = useState({
    tracking_number: "",
    origin: "",
    destination: "",
    expected_delivery: "",
    status: "Pending",
  });

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  function showMessage(text, type = "info") {
    setMessage(text);
    setMessageType(type);
  }

  async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Request failed");
    }
    if (res.status === 204) return null;
    return res.json();
  }

  async function fetchShipments() {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();

    if (filters.status) params.set("status", filters.status);
    if (filters.destination) params.set("destination", filters.destination);
    if (filters.start_date) params.set("start_date", filters.start_date);
    if (filters.end_date) params.set("end_date", filters.end_date);

    const query = params.toString() ? `?${params.toString()}` : "";
    try {
      const data = await request(`/shipments${query}`, { headers: authHeaders });
      setShipments(data);
      showMessage("Shipments loaded.", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchShipments();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function register() {
    setLoading(true);
    try {
      await request("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      showMessage("Registered successfully. You can now login.", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    setLoading(true);
    try {
      const data = await request("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      showMessage("Login successful.", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setShipments([]);
    showMessage("Logged out successfully.", "info");
  }

  async function createShipment(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await request("/shipments", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(createForm),
      });
      setCreateForm({
        tracking_number: "",
        origin: "",
        destination: "",
        expected_delivery: "",
        status: "Pending",
      });
      showMessage("Shipment created successfully.", "success");
      fetchShipments();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    setLoading(true);
    try {
      await request(`/shipments/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      showMessage(`Shipment ${id} moved to ${status}.`, "success");
      fetchShipments();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteShipment(id) {
    setLoading(true);
    try {
      await request(`/shipments/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      showMessage(`Shipment ${id} deleted.`, "success");
      fetchShipments();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    const reset = { status: "", destination: "", start_date: "", end_date: "" };
    setFilters(reset);
    setLoading(true);
    const params = new URLSearchParams();
    const query = params.toString() ? `?${params.toString()}` : "";
    request(`/shipments${query}`, { headers: authHeaders })
      .then((data) => {
        setShipments(data);
        showMessage("Filters cleared.", "success");
      })
      .catch((err) => showMessage(err.message, "error"))
      .finally(() => setLoading(false));
  }

  const statusCounts = shipments.reduce(
    (acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, "In Transit": 0, Delivered: 0 }
  );

  const activeUser = token ? "Authenticated" : "Guest";

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <p className="eyebrow">Shipment Tracking</p>
          <h1>Dashboard</h1>
          <p className="sub">Built with FastAPI, React, and SQLite/PostgreSQL.</p>
        </div>
        <div className="status-panel">
          <span className="badge badge-light">{activeUser}</span>
          <span className="badge badge-info">API {API_BASE}</span>
          <span className="badge badge-muted">{shipments.length} shipments</span>
        </div>
      </header>

      <section className="card auth-card">
        <div className="card-header">
          <h2>Auth</h2>
          <div className="card-actions">
            <button className="button-secondary" onClick={logout} disabled={!token || loading}>
              Logout
            </button>
          </div>
        </div>
        <div className="form-grid">
          <label>
            Username
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </label>
          <label>
            Password
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </label>
          <div className="auth-actions">
            <button onClick={register} disabled={loading} className="button-secondary">
              Register
            </button>
            <button onClick={login} disabled={loading} className="button-primary">
              Login
            </button>
          </div>
        </div>
      </section>

      {token && (
        <>
          <section className="card summary-card">
            <h2>Snapshot</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <strong>{shipments.length}</strong>
                <span>Total shipments</span>
              </div>
              <div className="summary-item">
                <strong>{statusCounts.Pending}</strong>
                <span>Pending</span>
              </div>
              <div className="summary-item">
                <strong>{statusCounts["In Transit"]}</strong>
                <span>In Transit</span>
              </div>
              <div className="summary-item">
                <strong>{statusCounts.Delivered}</strong>
                <span>Delivered</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Create Shipment</h2>
              <span className="hint">Fill the form and submit to add a new shipment.</span>
            </div>
            <form className="form-grid" onSubmit={createShipment}>
              <label>
                Tracking Number
                <input
                  required
                  placeholder="Tracking Number"
                  value={createForm.tracking_number}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, tracking_number: e.target.value })
                  }
                  disabled={loading}
                />
              </label>
              <label>
                Origin
                <input
                  required
                  placeholder="Origin"
                  value={createForm.origin}
                  onChange={(e) => setCreateForm({ ...createForm, origin: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                Destination
                <input
                  required
                  placeholder="Destination"
                  value={createForm.destination}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, destination: e.target.value })
                  }
                  disabled={loading}
                />
              </label>
              <label>
                Expected Delivery
                <input
                  required
                  type="datetime-local"
                  value={createForm.expected_delivery}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      expected_delivery: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </label>
              <label>
                Status
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  disabled={loading}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="button-primary" disabled={loading}>
                  Create shipment
                </button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Filters</h2>
                <span className="hint">Search by status, destination, or date range.</span>
              </div>
              <button className="button-secondary" onClick={clearFilters} disabled={loading}>
                Reset
              </button>
            </div>
            <div className="form-grid">
              <label>
                Status
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  disabled={loading}
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Destination
                <input
                  placeholder="Contains"
                  value={filters.destination}
                  onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                From
                <input
                  type="datetime-local"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                To
                <input
                  type="datetime-local"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  disabled={loading}
                />
              </label>
              <div className="form-actions">
                <button className="button-primary" onClick={fetchShipments} disabled={loading}>
                  Apply filters
                </button>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Shipments</h2>
                <span className="hint">Manage current shipments and update status.</span>
              </div>
              <button className="button-secondary" onClick={fetchShipments} disabled={loading}>
                Refresh
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tracking #</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Expected Delivery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td>{shipment.id}</td>
                      <td>{shipment.tracking_number}</td>
                      <td>
                        <strong>{shipment.origin}</strong> → {shipment.destination}
                      </td>
                      <td>
                        <span className={`badge badge-${shipment.status.replace(/\s+/g, "-").toLowerCase()}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td>{new Date(shipment.expected_delivery).toLocaleString()}</td>
                      <td className="actions-cell">
                        <select
                          value={shipment.status}
                          onChange={(e) => updateStatus(shipment.id, e.target.value)}
                          disabled={loading}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          className="button-danger"
                          onClick={() => deleteShipment(shipment.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {message && <p className={`message message-${messageType}`}>{message}</p>}
    </main>
  );
}

export default App;
