export type ModalMode = 'unlock' | 'encrypt';

export interface PasswordModalOptions {
  mode: ModalMode;
  title?: string;
  description?: string;
  onSubmit: (password: string) => Promise<boolean>;
  onCancel?: () => void;
}

export class PasswordModal {
  private modalOverlay: HTMLElement;
  private modalTitle: HTMLElement;
  private modalDescription: HTMLElement;
  private passwordInput: HTMLInputElement;
  private passwordConfirmInput: HTMLInputElement;
  private confirmGroup: HTMLElement;
  private strengthContainer: HTMLElement;
  private strengthText: HTMLElement;
  private strengthBarFill: HTMLElement;
  private errorBanner: HTMLElement;
  private errorText: HTMLElement;
  private toggleEyeBtn: HTMLElement;
  private closeBtn: HTMLElement;
  private cancelBtn: HTMLElement;
  private submitBtn: HTMLButtonElement;

  private currentOptions: PasswordModalOptions | null = null;

  constructor() {
    this.modalOverlay = document.getElementById('modal-password')!;
    this.modalTitle = document.getElementById('modal-title')!;
    this.modalDescription = document.getElementById('modal-description')!;
    this.passwordInput = document.getElementById('input-password') as HTMLInputElement;
    this.passwordConfirmInput = document.getElementById('input-password-confirm') as HTMLInputElement;
    this.confirmGroup = document.getElementById('form-group-confirm')!;
    this.strengthContainer = document.getElementById('password-strength-container')!;
    this.strengthText = document.getElementById('strength-text')!;
    this.strengthBarFill = document.getElementById('strength-bar-fill')!;
    this.errorBanner = document.getElementById('modal-error-banner')!;
    this.errorText = document.getElementById('modal-error-text')!;
    this.toggleEyeBtn = document.getElementById('btn-toggle-password')!;
    this.closeBtn = document.getElementById('modal-close-btn')!;
    this.cancelBtn = document.getElementById('btn-modal-cancel')!;
    this.submitBtn = document.getElementById('btn-modal-submit') as HTMLButtonElement;

    this.initEvents();
  }

  private initEvents(): void {
    this.toggleEyeBtn.addEventListener('click', () => {
      const type = this.passwordInput.type === 'password' ? 'text' : 'password';
      this.passwordInput.type = type;
      this.passwordConfirmInput.type = type;
      this.toggleEyeBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });

    this.passwordInput.addEventListener('input', () => {
      this.clearError();
      if (this.currentOptions?.mode === 'encrypt') {
        this.updateStrengthGauge(this.passwordInput.value);
      }
    });

    this.passwordConfirmInput.addEventListener('input', () => this.clearError());

    this.closeBtn.addEventListener('click', () => this.hide());
    this.cancelBtn.addEventListener('click', () => this.hide());

    this.submitBtn.addEventListener('click', () => this.handleSubmit());

    this.modalOverlay.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // If in encrypt mode and user is in first password box, move focus to confirm box if empty
        if (
          this.currentOptions?.mode === 'encrypt' &&
          document.activeElement === this.passwordInput &&
          !this.passwordConfirmInput.value
        ) {
          e.preventDefault();
          this.passwordConfirmInput.focus();
          return;
        }

        e.preventDefault();
        this.handleSubmit();
      } else if (e.key === 'Escape') {
        this.hide();
      }
    });
  }

  public show(options: PasswordModalOptions): void {
    this.currentOptions = options;
    this.passwordInput.value = '';
    this.passwordConfirmInput.value = '';
    this.passwordInput.type = 'password';
    this.passwordConfirmInput.type = 'password';
    this.toggleEyeBtn.textContent = '👁️';
    this.clearError();

    if (options.mode === 'unlock') {
      this.modalTitle.textContent = options.title || 'Şifre Anahtarı Girin';
      this.modalDescription.textContent = options.description || 'Dosyanın şifresini çözmek için anahtar parolayı girin.';
      this.confirmGroup.classList.add('hidden');
      this.strengthContainer.classList.add('hidden');
    } else {
      this.modalTitle.textContent = options.title || 'Şifreleme Anahtarı Belirleyin';
      this.modalDescription.textContent = options.description || 'Dosyanızı koruyacak güçlü bir şifre anahtarı belirleyin.';
      this.confirmGroup.classList.remove('hidden');
      this.strengthContainer.classList.remove('hidden');
      this.updateStrengthGauge('');
    }

    this.modalOverlay.classList.remove('hidden');
    setTimeout(() => this.passwordInput.focus(), 100);
  }

  public hide(): void {
    this.modalOverlay.classList.add('hidden');
    if (this.currentOptions?.onCancel) {
      this.currentOptions.onCancel();
    }
    this.currentOptions = null;
  }

  public showError(msg: string): void {
    this.errorText.textContent = msg;
    this.errorBanner.classList.remove('hidden');
  }

  public clearError(): void {
    this.errorText.textContent = '';
    this.errorBanner.classList.add('hidden');
  }

  private async handleSubmit(): Promise<void> {
    if (!this.currentOptions) return;

    const password = this.passwordInput.value;

    if (!password || password.trim().length === 0) {
      this.showError('Lütfen bir şifre girin.');
      this.passwordInput.focus();
      return;
    }

    if (this.currentOptions.mode === 'encrypt') {
      const confirm = this.passwordConfirmInput.value;
      if (!confirm) {
        this.showError('Lütfen şifre tekrarını da girin.');
        this.passwordConfirmInput.focus();
        return;
      }
      if (password !== confirm) {
        this.showError('Girdiğiniz şifreler birbiriyle eşleşmiyor!');
        this.passwordConfirmInput.focus();
        return;
      }
      if (password.length < 6) {
        this.showError('Şifre en az 6 karakter olmalıdır.');
        this.passwordInput.focus();
        return;
      }
    }

    this.submitBtn.disabled = true;
    this.submitBtn.textContent = 'Şifreleniyor...';

    try {
      const success = await this.currentOptions.onSubmit(password);
      if (success) {
        this.hide();
      }
    } catch (err: any) {
      this.showError(err.message || 'İşlem gerçekleştirilemedi.');
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Tamam';
    }
  }

  private updateStrengthGauge(pass: string): void {
    let score = 0;
    if (!pass) {
      this.strengthText.textContent = 'Şifre Girilmedi';
      this.strengthBarFill.className = 'strength-bar-fill';
      this.strengthBarFill.style.width = '0%';
      return;
    }

    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) {
      this.strengthText.textContent = 'Zayıf';
      this.strengthBarFill.className = 'strength-bar-fill strength-weak';
    } else if (score === 2) {
      this.strengthText.textContent = 'Orta';
      this.strengthBarFill.className = 'strength-bar-fill strength-medium';
    } else if (score === 3) {
      this.strengthText.textContent = 'Güçlü';
      this.strengthBarFill.className = 'strength-bar-fill strength-strong';
    } else {
      this.strengthText.textContent = 'Çok Güçlü (Önerilen)';
      this.strengthBarFill.className = 'strength-bar-fill strength-robust';
    }
  }
}
