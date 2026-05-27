import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";
import "../../../features/auth/styles/login/login.css";

export default function ChangePasswordPage() {
   
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   
    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></svg>
    );
    const EyeSlashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709zM11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z" /><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z" /></svg>
    );

    return (
        <div className="d-flex flex-column vh-100">
            <HeroHeader />
            <div className="d-flex align-items-center justify-content-center page-wrapper flex-grow-1 flex-shrink-1 p-3 overflow-auto" style={{ minHeight: 0 }}>
                
                <div className="login-card-container p-4 p-md-5 d-flex flex-column" style={{ maxWidth: "450px", width: "100%", borderRadius: "20px", background: "#fff" }}>
                    
                    <div className="text-center mb-4">
                        <h2>Change Password</h2>
                    </div>

                    <Form>
                        <Form.Group className="mb-4 password-wrapper" controlId="oldPassword">
                            <Form.Control
                                type={showOldPassword ? "text" : "password"}
                                className="input-clean-underline"
                                placeholder="Current Password"
                            />
                            <span className="password-toggle-icon" onClick={() => setShowOldPassword(!showOldPassword)}>
                                {showOldPassword ? <EyeIcon /> : <EyeSlashIcon />}
                            </span>
                        </Form.Group>

                        <Form.Group className="mb-4 password-wrapper" controlId="newPassword">
                            <Form.Control
                                type={showNewPassword ? "text" : "password"}
                                className="input-clean-underline"
                                placeholder="New Password"
                            />
                            <span className="password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                                {showNewPassword ? <EyeIcon /> : <EyeSlashIcon />}
                            </span>
                        </Form.Group>

                        
                        <Form.Group className="mb-4 password-wrapper" controlId="confirmPassword">
                            <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                className="input-clean-underline"
                                placeholder="Confirm New Password"
                            />
                            <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                            </span>
                        </Form.Group>
                     
                        <Button className="w-100 btn-purple-login mt-4" type="button">
                            Save Changes
                        </Button>
                    </Form>
                </div>
            </div>

            <HeroFooter />
        </div>
    );
}