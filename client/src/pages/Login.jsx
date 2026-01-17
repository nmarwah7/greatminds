import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import "../index.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (email, password) => {
        setError("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
                const userData = userDoc.data();
                navigate("/dashboard");
            } else {
                setError("No information");
            }
        } catch (error) {
            setError("Invalid email or password");
            console.error("Login error: ", error);
        }
    };

    return (
        <div className="login-root">
            <div className="animated-bg" />

            <div className="login-content">
                <h1 className="title">GreatMiNDs</h1>

                <div className="login-card">
                    <h2 className="login-card-title">Login</h2>

                    {error && (
                        <div style={{
                            color: "red",
                            marginBottom: "10px",
                            fontSize: "14px",
                            textAlign: "center"
                        }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className="login-btn" onClick={() => handleLogin(email, password)}>
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
