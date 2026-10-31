/**
 * OTP Verification & Device Security System
 * Handles 6-digit email verification via Brevo API and unrecognized browser detection.
 */

class OTPVerification {
    constructor() {
        this.modal = null;
        this.currentEmail = '';
        this.currentPurpose = 'login';
        this.currentToken = null;
        this.onSuccess = null;
        this.onFailure = null;
        this.resendTimer = null;
        this.resendCountdown = 60;
        this.isVerifying = false;
        this.isSending = false;
    }

    // -------------------------------------------------------------
    // Device & Browser Recognition
    // -------------------------------------------------------------
    getDeviceId() {
        try {
            let deviceId = localStorage.getItem('elite_device_id');
            if (!deviceId) {
                deviceId = 'dev_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
                localStorage.setItem('elite_device_id', deviceId);
            }
            return deviceId;
        } catch {
            return 'dev_unknown_browser';
        }
    }

    getStorageKey(email) {
        const clean = String(email || '').trim().toLowerCase();
        let hash = 'default';
        try {
            hash = btoa(clean).replace(/=/g, '');
        } catch {
            hash = clean.replace(/[^a-zA-Z0-9]/g, '_');
        }
        return `elite_recognized_device_${hash}`;
    }

    isDeviceRecognized(email) {
        if (!email) return false;
        try {
            const key = this.getStorageKey(email);
            const verified = localStorage.getItem(key);
            const devId = localStorage.getItem('elite_device_id');
            const verifiedDevId = localStorage.getItem(`${key}_id`);

            if (verified === 'true' && (!verifiedDevId || verifiedDevId === devId)) {
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    markDeviceRecognized(email) {
        if (!email) return;
        try {
            const key = this.getStorageKey(email);
            const devId = this.getDeviceId();
            localStorage.setItem(key, 'true');
            localStorage.setItem(`${key}_id`, devId);
            localStorage.setItem('elite_last_verified_at', new Date().toISOString());
        } catch (e) {
            console.warn('Failed to store device recognition:', e);
        }
    }

    clearDeviceRecognition(email) {
        if (!email) return;
        try {
            const key = this.getStorageKey(email);
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_id`);
        } catch (e) {
            console.warn('Failed to clear device recognition:', e);
        }
    }

    // -------------------------------------------------------------
    // Modal Initialization & Rendering
    // -------------------------------------------------------------
    init() {
        if (document.getElementById('otp-modal')) {
            this.modal = document.getElementById('otp-modal');
            return;
        }

        const modalHTML = `
            <div id="otp-modal" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.92); z-index: 100000; align-items: center; justify-content: center; backdrop-filter: blur(8px); padding: 15px;">
                <div style="background: linear-gradient(135deg, #111827 0%, #080c14 100%); border: 2px solid #d4af37; border-radius: 16px; padding: 32px 28px; max-width: 460px; width: 100%; box-shadow: 0 0 50px rgba(212, 175, 55, 0.35); text-align: center; position: relative;">
                    
                    <button id="otp-close-x" type="button" style="position: absolute; top: 14px; right: 18px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer; transition: color 0.2s;" title="Close">&times;</button>

                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #d4af37, #FCD34D); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);">
                        <i class="fas fa-shield-alt" style="color: #0F172A; font-size: 28px;"></i>
                    </div>

                    <h2 id="otp-title" style="color: #d4af37; font-size: 22px; font-weight: 800; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                        Email Verification
                    </h2>
                    
                    <p id="otp-subtitle" style="color: #cbd5e1; font-size: 13.5px; line-height: 1.5; margin: 0 0 6px 0;">
                        Enter the 6-digit code sent to your email.
                    </p>

                    <div id="otp-email-badge" style="display: inline-block; background: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 20px; padding: 4px 14px; color: #facc15; font-size: 12.5px; font-weight: 600; margin-bottom: 20px; word-break: break-all;">
                        user@example.com
                    </div>

                    <div id="otp-error" style="display: none; background: rgba(239, 68, 68, 0.15); border: 1px solid #EF4444; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; text-align: left;">
                        <p style="color: #fca5a5; font-size: 13px; margin: 0; line-height: 1.4;" id="otp-error-text"></p>
                    </div>

                    <div id="otp-success" style="display: none; background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px;">
                        <p style="color: #6ee7b7; font-size: 13px; margin: 0; font-weight: 600;" id="otp-success-text">Code verified successfully!</p>
                    </div>

                    <!-- 6 Digit Input Group -->
                    <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 22px;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="0" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="1" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="2" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="3" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="4" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                        <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" class="otp-digit" data-idx="5" style="width: 48px; height: 56px; background: #020617; border: 2px solid #475569; border-radius: 8px; color: #FCD34D; font-size: 26px; font-weight: 800; text-align: center; outline: none; transition: border-color 0.2s, box-shadow 0.2s;">
                    </div>

                    <button id="otp-verify-btn" type="button" style="width: 100%; background: linear-gradient(135deg, #d4af37, #facc15); color: #020617; border: none; border-radius: 8px; padding: 14px; font-size: 15px; font-weight: 800; cursor: pointer; transition: transform 0.15s, box-shadow 0.2s; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; box-shadow: 0 4px 18px rgba(212, 175, 55, 0.4);">
                        Verify & Authorize
                    </button>

                    <div style="text-align: center; margin-top: 10px;">
                        <span style="color: #64748b; font-size: 13px;">Didn't receive the email code? </span>
                        <button id="otp-resend-btn" type="button" style="background: none; border: none; color: #d4af37; font-weight: 700; font-size: 13px; cursor: pointer; text-decoration: underline; padding: 0 4px;">
                            Resend Code
                        </button>
                        <span id="otp-resend-timer" style="display: none; color: #94a3b8; font-size: 13px;">
                            Resend available in <strong id="otp-countdown" style="color: #facc15;">60</strong>s
                        </span>
                    </div>

                    <div style="margin-top: 18px; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 14px;">
                        <button id="otp-cancel-btn" type="button" style="background: transparent; color: #94a3b8; border: none; font-size: 13px; cursor: pointer; padding: 6px 12px; transition: color 0.2s;">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('otp-modal');
        this.setupEventListeners();
    }

    setupEventListeners() {
        const inputs = this.modal.querySelectorAll('.otp-digit');
        const verifyBtn = document.getElementById('otp-verify-btn');
        const resendBtn = document.getElementById('otp-resend-btn');
        const cancelBtn = document.getElementById('otp-cancel-btn');
        const closeX = document.getElementById('otp-close-x');

        inputs.forEach((input, index) => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '#d4af37';
                input.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.5)';
                input.select();
            });

            input.addEventListener('blur', () => {
                input.style.borderColor = '#475569';
                input.style.boxShadow = 'none';
            });

            input.addEventListener('input', (e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val ? val[val.length - 1] : '';

                if (e.target.value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

                // If all 6 digits entered, auto-verify
                const fullCode = Array.from(inputs).map(i => i.value).join('');
                if (fullCode.length === 6) {
                    setTimeout(() => this.verifyCode(), 100);
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    inputs[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                } else if (e.key === 'Enter') {
                    this.verifyCode();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                const digits = paste.replace(/[^0-9]/g, '').slice(0, 6);
                if (digits) {
                    digits.split('').forEach((d, i) => {
                        if (inputs[i]) inputs[i].value = d;
                    });
                    const targetIndex = Math.min(digits.length, 5);
                    inputs[targetIndex].focus();

                    if (digits.length === 6) {
                        setTimeout(() => this.verifyCode(), 150);
                    }
                }
            });
        });

        if (verifyBtn) verifyBtn.addEventListener('click', () => this.verifyCode());
        if (resendBtn) resendBtn.addEventListener('click', () => this.resendCode());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.handleCancel());
        if (closeX) closeX.addEventListener('click', () => this.handleCancel());
    }

    // -------------------------------------------------------------
    // Display Modal & Configure Text
    // -------------------------------------------------------------
    show(email, purpose = 'login', onSuccess = null, onFailure = null) {
        this.init();
        this.currentEmail = String(email || '').trim().toLowerCase();
        this.currentPurpose = purpose;
        this.onSuccess = onSuccess;
        this.onFailure = onFailure;
        this.currentToken = null;

        const titleEl = document.getElementById('otp-title');
        const subEl = document.getElementById('otp-subtitle');
        const badgeEl = document.getElementById('otp-email-badge');

        if (badgeEl) badgeEl.textContent = this.currentEmail || 'your email';

        if (purpose === 'payment') {
            if (titleEl) titleEl.textContent = 'Payment Gateway Verification';
            if (subEl) subEl.textContent = 'You are linking or updating a payout gateway method. Enter the 6-digit authorization code dispatched to:';
        } else if (purpose === 'device' || purpose === 'browser') {
            if (titleEl) titleEl.textContent = 'New Browser Detected';
            if (subEl) subEl.textContent = 'Access attempt from an unrecognized browser. Enter the 6-digit code dispatched to:';
        } else if (purpose === 'approval') {
            if (titleEl) titleEl.textContent = 'Account Approved & Ready';
            if (subEl) subEl.textContent = 'Your application has been approved! Enter the 6-digit activation code dispatched to:';
        } else {
            if (titleEl) titleEl.textContent = 'Elite Account Authentication';
            if (subEl) subEl.textContent = 'Enter the 6-digit security code dispatched to:';
        }

        // Clear previous state
        this.resetInputs();
        this.hideMessages();

        // Send code via Brevo API
        this.sendCode();

        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const first = this.modal.querySelector('.otp-digit');
            if (first) first.focus();
        }, 150);
    }

    verifyAsync(email, purpose = 'login') {
        return new Promise((resolve, reject) => {
            this.show(
                email,
                purpose,
                () => resolve(true),
                (err) => reject(err || new Error('Verification cancelled'))
            );
        });
    }

    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (this.resendTimer) {
            clearInterval(this.resendTimer);
            this.resendTimer = null;
        }
    }

    handleCancel() {
        this.hide();
        if (typeof this.onFailure === 'function') {
            this.onFailure(new Error('User cancelled verification'));
        }
    }

    resetInputs() {
        if (!this.modal) return;
        const inputs = this.modal.querySelectorAll('.otp-digit');
        inputs.forEach(i => {
            i.value = '';
            i.style.borderColor = '#475569';
        });
    }

    hideMessages() {
        const err = document.getElementById('otp-error');
        const succ = document.getElementById('otp-success');
        if (err) err.style.display = 'none';
        if (succ) succ.style.display = 'none';
    }

    showError(msg) {
        const err = document.getElementById('otp-error');
        const errText = document.getElementById('otp-error-text');
        const succ = document.getElementById('otp-success');
        if (succ) succ.style.display = 'none';

        if (errText) errText.textContent = msg || 'Invalid code. Please try again.';
        if (err) err.style.display = 'block';

        if (this.modal) {
            const inputs = this.modal.querySelectorAll('.otp-digit');
            inputs.forEach(i => {
                i.style.borderColor = '#EF4444';
            });
            setTimeout(() => {
                inputs.forEach(i => { i.style.borderColor = '#475569'; });
            }, 1200);
        }
    }

    showSuccess(msg) {
        const err = document.getElementById('otp-error');
        const succ = document.getElementById('otp-success');
        const succText = document.getElementById('otp-success-text');
        if (err) err.style.display = 'none';

        if (succText) succText.textContent = msg || 'Code verified successfully!';
        if (succ) succ.style.display = 'block';
    }

    // -------------------------------------------------------------
    // API Dispatch (Brevo API backend function)
    // -------------------------------------------------------------
    async sendCode() {
        if (this.isSending) return;
        this.isSending = true;
        this.hideMessages();

        try {
            // Attempt primary Netlify function send-verification-email
            let response = await fetch('/.netlify/functions/send-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send',
                    email: this.currentEmail,
                    purpose: this.currentPurpose
                })
            });

            // Fallback to send-otp if function name differs
            if (response.status === 404) {
                response = await fetch('/.netlify/functions/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.currentEmail,
                        purpose: this.currentPurpose
                    })
                });
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Failed to dispatch verification code email');
            }

            if (data.token) {
                this.currentToken = data.token;
            }

            this.startResendTimer();
        } catch (error) {
            console.error('Error sending verification code:', error);
            this.showError(`Email dispatch error: ${error.message || 'Please check BREVO_API_KEY configuration.'}`);
        } finally {
            this.isSending = false;
        }
    }

    async resendCode() {
        const resendBtn = document.getElementById('otp-resend-btn');
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
        }
        await this.sendCode();
        if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Code';
        }
    }

    startResendTimer() {
        this.resendCountdown = 60;
        const resendBtn = document.getElementById('otp-resend-btn');
        const timerContainer = document.getElementById('otp-resend-timer');
        const countdownEl = document.getElementById('otp-countdown');

        if (resendBtn) resendBtn.style.display = 'none';
        if (timerContainer) timerContainer.style.display = 'inline';
        if (countdownEl) countdownEl.textContent = this.resendCountdown;

        if (this.resendTimer) clearInterval(this.resendTimer);

        this.resendTimer = setInterval(() => {
            this.resendCountdown--;
            if (countdownEl) countdownEl.textContent = this.resendCountdown;

            if (this.resendCountdown <= 0) {
                clearInterval(this.resendTimer);
                this.resendTimer = null;
                if (resendBtn) resendBtn.style.display = 'inline';
                if (timerContainer) timerContainer.style.display = 'none';
            }
        }, 1000);
    }

    // -------------------------------------------------------------
    // Code Verification
    // -------------------------------------------------------------
    async verifyCode() {
        if (this.isVerifying) return;
        const inputs = this.modal.querySelectorAll('.otp-digit');
        const code = Array.from(inputs).map(i => i.value).join('');

        if (code.length !== 6) {
            this.showError('Please enter all 6 digits.');
            return;
        }

        const verifyBtn = document.getElementById('otp-verify-btn');
        this.isVerifying = true;
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        }

        try {
            // Attempt send-verification-email verify action
            let response = await fetch('/.netlify/functions/send-verification-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify',
                    email: this.currentEmail,
                    code: code,
                    purpose: this.currentPurpose,
                    token: this.currentToken
                })
            });

            // Fallback to verify-otp if 404
            if (response.status === 404) {
                response = await fetch('/.netlify/functions/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: this.currentEmail,
                        code: code,
                        purpose: this.currentPurpose,
                        token: this.currentToken
                    })
                });
            }

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Verification failed. Incorrect or expired code.');
            }

            // Mark device as recognized for device/login/approval purposes
            if (this.currentPurpose === 'device' || this.currentPurpose === 'browser' || this.currentPurpose === 'approval' || this.currentPurpose === 'login') {
                this.markDeviceRecognized(this.currentEmail);
            }

            this.showSuccess('Code verified successfully! Proceeding...');

            setTimeout(() => {
                this.hide();
                if (typeof this.onSuccess === 'function') {
                    this.onSuccess(data);
                }
            }, 800);

        } catch (error) {
            console.error('Verification error:', error);
            this.showError(error.message || 'Verification failed. Please check the code and try again.');
            if (typeof this.onFailure === 'function') {
                this.onFailure(error);
            }
        } finally {
            this.isVerifying = false;
            if (verifyBtn) {
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = 'Verify & Authorize';
            }
        }
    }
}

// Global Singleton Instance
window.OTPVerification = new OTPVerification();
