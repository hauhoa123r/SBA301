import { useAuth } from "../../../app/provider/AuthProvider";

export default function Homepage() {
    const { user, setUser } = useAuth();

    return (    
        
        <>
            <h1>Welcome, {user}</h1>
            <button onClick={() => setUser("Hi")}>
                Logout
            </button>
            
            </>
            
    );
}