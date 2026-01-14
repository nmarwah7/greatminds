import { useNavigate } from "react-router-dom";
import RoleCard from "../components/RoleCard";
import "../index.css";

export default function Home() {
    const navigate = useNavigate();

    const login = () => {
        navigate("/login");
    };

    return (
        <div className="home-root">
            <div className="animated-bg" />

            <div className="home-content">
                <h1 className="hero-title">GreatMiNDs</h1>

                <p className="subtitle">
                    Think alike, work alike
                </p>

                <RoleCard
                    icon="🔐"
                    title="Login"
                    description="Whether you are staff, participants, caregivers, or volunteers: join us!"
                    onClick={login}
                />
            </div>
        </div>
    );
}
