/**
 * OTP Verification System
 * Handles 6-digit email verification for login, payment, and device verification
 */

class OTPVerification {
    constructor() {
        this.modal = null;
        this.currentEmail = '';
        this.currentPurpose = 'login';
        this.onSuccess = null;
        this.onFailure = null;
        this.resendTimer = null;
        this.resendCountdown = 60;
    }

    /**
     * Initialize the OTP modal
     */
    init() {
        if (document.getElementById('otp-modal')) return;

        const modalHTML = `
            <div id="otp-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100000; display: flex; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); border: 2px solid #d4af37; border-radius: 16px; padding: 32px; max-width: 440px; width: 90%; box-shadow: 0 0 40px rgba(212, 175, 55, 0.3);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #d4af37, #FCD34D); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);">
                            <i class="fas fa-shield-alt" style="color: #0F172A; font-size: 28px;"></i>
                        </div>
                        <h2 style="color: #d4af37; font-size: 24px; font-weight: 700; margin-bottom: 8px;">Email Verification</h2>
                        <p id="otp-message" style="color: #CBD5E1; font-size: 14px; line-height: 1.6;">Enter the 6-digit code sent to your email</p>
                    </div>

                    <div id="otp-error" style="display: none; background: rgba(239, 68, 68, 0.2); border: 1px solid #EF4444; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <p style="color: #EF4444; font-size: 14px; margin: 0;" id="otp-error-text"></p>
                    </div>

                    <div id="otp-success" style="display: none; background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                        <p style="color: #10B981; font-size: 14px; margin: 0;">Code verified successfully!</p>
                    </div>

                    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 20px;">
                        <input type="text" maxlength="1" class="otp-input" style="width: 48px; height: 56px; background: #0F172A; border: 2px solid #475569; border-radius: 8px; color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; outline: none; transition: all 0.3s;">
                        <input type="text" maxlength="1" class="otp-input" style="width: 48px; height: 56px; background: #0F172A; border: 2px solid #475569; border-radius: 8px; color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; outline: none; transition: all 0.3s;">
                        <input type="text" maxlength="1" class="otp-input" style="width: 48px; height: 56px; background: #0F172A; border: 2px solid #475569; border-radius: 8px; color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; outline: none; transition: all 0.3s;">
                        <input type="text" maxlength="1" class="otp-input" style="width: 48px; height: 56px; background: #0F172A; border: 2px solid #475569; border-radius: 8px; color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; outline: none; transition: all 0.3s;">
                        <input type="text" maxlength="1" class="otp-input" style="width: 48px; height: 56px; background: #0F172A; border: 2px solid #475569; border-radius: 8px; color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; outline: none; transition: all 0.3s;">
                        <input type="text" maxlength="1" class="otp-input" style="width: 48px; height: 56px; background: #0F172A; border: 2px solid #475569; border-radius: 8px; color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; outline: none; transition: all 0.3s;">
                    </div>

                    <button id="verify-btn" style="width: 100%; background: linear-gradient(135deg, #d4af37, #FCD34D); color: #0F172A; border: none; border-radius: 8px; padding: 14px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s; margin-bottom: 12px;">
                        Verify Code
                    </button>

                    <div style="text-align: center;">
                        <p style="color: #64748B; font-size: 13px; margin-bottom: 8px;">Didn't receive the code?</p>
                        <button id="resend-btn" style="background: transparent; color: #d4af37; border: 1px solid #d4af37; border-radius: 6px; padding: 8px 16px; font-size: 14px; cursor: pointer; transition: all 0.3s;">
                            Resend Code
                        </button>
                        <p id="resend-timer" style="color: #64748B; font-size: 13px; display: none; margin-top: 8px;">
                            Resend available in <span id="countdown">60</span>s
                        </p>
                    </div>

                    <button id="close-modal" style="background: transparent; color: #64748B; border: none; font-size: 14px; cursor: pointer; margin-top: 16px; width: 100%; padding: 8px;">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('otp-modal');
        this.setupEventListeners();
    }

    /**
     * Setup event listeners for the modal
     */
    setupEventListeners() {
        const inputs = document.querySelectorAll('.otp-input');
        const verifyBtn = document.getElementById('verify-btn');
        const resendBtn = document.getElementById('resend-btn');
        const closeModal = document.getElementById('close-modal');

        // Handle input focus and auto-advance
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value.length === 1 && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').slice(0, 6);
                pastedData.split('').forEach((char, i) => {
                    if (inputs[i]) {
                        inputs[i].value = char;
                    }
                });
                if (inputs[Math.min(pastedData.length, 5)]) {
                    inputs[Math.min(pastedData.length, 5)].focus();
                }
            });
        });

        // Verify button
        verifyBtn.addEventListener('click', () => this.verifyCode());

        // Resend button
        resendBtn.addEventListener('click', () => this.resendCode());

        // Close modal
        closeModal.addEventListener('click', () => this.hide());

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
    }

    /**
     * Show the OTP modal
     * @param {string} email - User's email address
     * @param {string} purpose - Purpose of verification (login, payment, device)
     * @param {function} onSuccess - Callback on successful verification
     * @param {function} onFailure - Callback on failed verification
     */
    show(email, purpose = 'login', onSuccess = null, onFailure = null) {
        this.init();
        this.currentEmail = email;
        this.currentPurpose = purpose;
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;

        // Update message based on purpose
        const messageEl = document.getElementById('otp-message');
        switch (purpose) {
            case 'login':
                messageEl.textContent = 'Enter the 6-digit code sent to your email to log in';
                break;
            case 'payment':
                messageEl.textContent = 'Enter the 6-digit code sent to your email to verify your payment method';
                break;
            case 'device':
                messageEl.textContent = 'Enter the 6-digit code sent to your email to verify this new device';
                break;
            default:
                messageEl.textContent = 'Enter the 6-digit code sent to your email';
        }

        // Reset form
        document.querySelectorAll('.otp-input').forEach(input => {
            input.value = '';
            input.style.borderColor = '#475569';
        });
        document.getElementById('otp-error').style.display = 'none';
        document.getElementById('otp-success').style.display = 'none';

        // Send initial code
        this.sendCode();

        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide the modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (this.resendTimer) {
            clearInterval(this.resendTimer);
        }
    }

    /**
     * Send OTP code via API
     */
    async sendCode() {
        try {
            const response = await fetch('/.netlify/functions/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.currentEmail,
                    purpose: this.currentPurpose
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send code');
            }

            this.startResendTimer();
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Verify the entered code
     */
    async verifyCode() {
        const inputs = document.querySelectorAll('.otp-input');
        const code = Array.from(inputs).map(input => input.value).join('');

        if (code.length !== 6) {
            this.showError('Please enter all 6 digits');
            return;
        }

        const verifyBtn = document.getElementById('verify-btn');
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const response = await fetch('/.netlify/functions/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.currentEmail,
                    code: code,
                    purpose: this.currentPurpose
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            // Show success
            document.getElementById('otp-success').style.display = 'block';
            document.getElementById('otp-error').style.display = 'none';

            setTimeout(() => {
                this.hide();
                if (this.onSuccess) {
                    this.onSuccess();
                }
            }, 1000);
        } catch (error) {
            this.showError(error.message);
            if (this.onFailure) {
                this.onFailure(error);
            }
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify Code';
        }
    }

    /**
     * Resend the code
     */
    async resendCode() {
        const resendBtn = document.getElementById('resend-btn');
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';

        await this.sendCode();

        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend Code';
    }

    /**
     * Start the resend countdown timer
     */
    startResendTimer() {
        this.resendCountdown = 60;
        const resendBtn = document.getElementById('resend-btn');
        const resendTimer = document.getElementById('resend-timer');
        const countdownEl = document.getElementById('countdown');

        resendBtn.style.display = 'none';
        resendTimer.style.display = 'block';

        if (this.resendTimer) {
            clearInterval(this.resendTimer);
        }

        this.resendTimer = setInterval(() => {
            this.resendCountdown--;
            countdownEl.textContent = this.resendCountdown;

            if (this.resendCountdown <= 0) {
                clearInterval(this.resendTimer);
                resendBtn.style.display = 'inline-block';
                resendTimer.style.display = 'none';
            }
        }, 1000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorEl = document.getElementById('otp-error');
        const errorText = document.getElementById('otp-error-text');
        errorText.textContent = message;
        errorEl.style.display = 'block';

        // Flash inputs red
        document.querySelectorAll('.otp-input').forEach(input => {
            input.style.borderColor = '#EF4444';
            setTimeout(() => {
                input.style.borderColor = '#475569';
            }, 1000);
        });
    }
}

// Create global instance
window.OTPVerification = new OTPVerification();
