export default function LoginCard({ onLogin }) {
    return (
      <div className="login-card">
  
        <h2 className="login-card-title">Login</h2>
  
        <input
          type="text"
          placeholder="Username"
          className="login-input"
        />
  
        <input
          type="password"
          placeholder="Password"
          className="login-input"
        />
  
        <button className="login-btn" onClick={onLogin}>
          Login
        </button>
      </div>
    );
  }
  