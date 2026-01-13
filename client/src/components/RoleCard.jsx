export default function RoleCard({ icon, title, description, onClick }) {
    return (
      <button
        onClick={onClick}
        style={{
          border: "none",
          borderRadius: "20px",
          padding: "32px",
          width: "680",
          background: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          cursor: "pointer",
          textAlign: "center",
          opacity:0.9
        }}
      >
        <div style={{ fontSize: "40px" }}>{icon}</div>
        <h2 style={{ margin: "12px 0 4px" }}>{title}</h2>
        <p style={{ color: "#555", fontSize: "15px" }}>{description}</p>
      </button>
    );
  }
  