package com.app.features.mailSender.service;

import org.springframework.stereotype.Component;

@Component
public class MailTemplateService {
    public String resetPasswordSubject() {
        return "Đặt lại mật khẩu - Chinese Online Learning";
    }
    public String verifyAccountSubject() {
        return "Xác thực tài khoản - Chinese Online Learning";
    }

    public String resetPasswordHtml(String token) {
        return """
                <div style="font-family:Arial,sans-serif;background:#f4f6fb;padding:40px;">
                    <div style="max-width:600px;margin:auto;background:#ffffff;
                                border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,.08);">
                        <div style="background:#2563EB;padding:30px;text-align:center;color:#fff;">
                            <h2 style="margin:0;"> Đặt lại mật khẩu</h2>
                        </div>
                        <div style="padding:35px;line-height:1.8;color:#333;">
                            <p>Xin chào,</p>
                            <p>
                                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                            </p>
                            <p>
                                Vui lòng sử dụng mã xác thực bên dưới để tiếp tục:
                            </p>
                            <div style="
                                    margin:30px 0;
                                    padding:18px;
                                    background:#F3F4F6;
                                    border:2px dashed #2563EB;
                                    border-radius:8px;
                                    text-align:center;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:8px;">
                                %s
                            </div>
                            <p>
                                Mã xác thực có hiệu lực trong <strong>15 phút</strong>.
                            </p>
                            <p>
                                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                            </p>
                        </div>
                        <div style="padding:20px;text-align:center;
                                    background:#f9fafb;font-size:13px;color:#777;">
                            © Chinese Online Learning<br>
                            Đây là email tự động, vui lòng không trả lời email này.
                        </div>
                    </div> 
                </div>
                """.formatted(token);
    }

    public String verifyAccountHtml(String verificationUrl) {
        return """
                <div style="font-family:Arial,sans-serif;background:#f4f6fb;padding:40px;">
                    <div style="max-width:600px;margin:auto;background:#ffffff;
                                border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 20px rgba(0,0,0,.08);">
                        <div style="background:#16A34A;padding:30px;text-align:center;color:#fff;">
                            <h2 style="margin:0;"> Chào mừng bạn đến với Chinese Online Learning</h2>
                        </div>

                        <div style="padding:35px;line-height:1.8;color:#333;">
                            <p>Xin chào,</p>
                            <p>
                                Cảm ơn bạn đã đăng ký tài khoản tại
                                <strong>Chinese Online Learning</strong>.
                            </p>

                            <p>
                                Để bắt đầu sử dụng hệ thống, vui lòng nhấn vào nút bên dưới để xác thực email.
                            </p>

                            <div style="text-align:center;margin:35px 0;">

                                <a href="%s"
                                   style="
                                        display:inline-block;
                                        padding:15px 35px;
                                        background:#16A34A;
                                        color:#fff;
                                        text-decoration:none;
                                        border-radius:8px;
                                        font-weight:bold;">
                                    Xác thực tài khoản
                                </a>

                            </div>
                            <p>Nếu nút trên không hoạt động, hãy sao chép liên kết sau vào trình duyệt:</p>
                            <p style="word-break:break-all;">
                                <a href="%s">%s</a>
                            </p>
                            <p>
                                Liên kết xác thực sẽ hết hạn sau
                                <strong>15 phút</strong>.
                            </p>
                            <p>
                                Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.
                            </p>
                        </div>
                        <div style="padding:20px;text-align:center;
                                    background:#f9fafb;font-size:13px;color:#777;">
                            © Chinese Online Learning<br>
                            Đây là email tự động, vui lòng không trả lời email này.
                        </div>
                    </div>
                </div>
                """.formatted(
                verificationUrl,
                verificationUrl,
                verificationUrl
        );
    }


}
