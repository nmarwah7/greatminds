import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div style={{ padding: "32px" }}>
      <div
        style={{
          background: "white",
          padding: "20px 28px",
          borderRadius: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Hello, user details</h2>
          <p style={{ margin: 0, color: "#555" }}>
            Logged in as <strong>{role}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
          style={{
            border: "none",
            borderRadius: "12px",
            padding: "10px 16px",
            cursor: "pointer"
          }}
        >
          Log out
        </button>
      </div>

      {/* Calendar placeholder */}
      <div
        style={{
          marginTop: "32px",
          background: "white",
          borderRadius: "20px",
          height: "420px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          fontSize: "20px",
          color: "#777"
        }}
      >
        Calendar will go here
      </div>
    </div>
  );
}
