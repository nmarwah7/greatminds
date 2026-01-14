import { useNavigate } from "react-router-dom";
import LoginCard from "../components/LoginCard";
import "../index.css";

export default function Login() {
    const navigate = useNavigate();

    const login = () => {
        navigate("/dashboard");
    };

    return (
        <div className="login-root">
            <div className="animated-bg" />

            <div className="login-content">
                <h1 className="title">GreatMiNDs</h1>

                <LoginCard onLogin={login} />
            </div>
        </div>
    );
}
