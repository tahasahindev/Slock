import { ApiService } from './services/ApiService.js';
import { Editor } from './components/Editor.js';
import { PasswordModal } from './components/PasswordModal.js';
import { Notification } from './components/Notification.js';

class AppController {
  private editor: Editor;
  private passwordModal: PasswordModal;

  private confirmModalOverlay: HTMLElement;
  private confirmProceedBtn: HTMLElement;
  private confirmCancelBtn: HTMLElement;
  private pendingConfirmAction: (() => void) | null = null;

  private currentPassword: string | null = null;
  private changePasswordBtn: HTMLElement | null = null;

  constructor() {
    this.editor = new Editor();
    this.passwordModal = new PasswordModal();

    this.confirmModalOverlay = document.getElementById('modal-confirm')!;
    this.confirmProceedBtn = document.getElementById('btn-confirm-proceed')!;
    this.confirmCancelBtn = document.getElementById('btn-confirm-cancel')!;
    this.changePasswordBtn = document.getElementById('btn-change-password');

    this.initToolbar();
    this.initKeyboardShortcuts();
    this.initConfirmationModal();

    Notification.show('Slock Güvenli Editör Hazır.', 'info');
  }

  private initToolbar(): void {
    document.getElementById('btn-new')?.addEventListener('click', () => this.handleNewFile());
    document.getElementById('btn-open')?.addEventListener('click', () => this.handleOpenFile());
    document.getElementById('btn-save')?.addEventListener('click', () => this.handleSaveFile());
    this.changePasswordBtn?.addEventListener('click', () => this.handleChangePassword());
  }

  private updateToolbarState(): void {
    if (this.currentPassword !== null || this.editor.getState().isEncrypted) {
      this.changePasswordBtn?.classList.remove('hidden');
    } else {
      this.changePasswordBtn?.classList.add('hidden');
    }
  }

  private initKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            this.handleNewFile();
            break;
          case 'o':
            e.preventDefault();
            this.handleOpenFile();
            break;
          case 's':
            e.preventDefault();
            this.handleSaveFile();
            break;
        }
      }
    });
  }

  private initConfirmationModal(): void {
    this.confirmCancelBtn.addEventListener('click', () => {
      this.confirmModalOverlay.classList.add('hidden');
      this.pendingConfirmAction = null;
    });

    this.confirmProceedBtn.addEventListener('click', () => {
      this.confirmModalOverlay.classList.add('hidden');
      if (this.pendingConfirmAction) {
        const action = this.pendingConfirmAction;
        this.pendingConfirmAction = null;
        action();
      }
    });
  }

  private checkUnsavedGuard(action: () => void): void {
    const state = this.editor.getState();
    if (state.isDirty && this.editor.getContent().trim().length > 0) {
      this.pendingConfirmAction = action;
      this.confirmModalOverlay.classList.remove('hidden');
    } else {
      action();
    }
  }

  private handleNewFile(): void {
    this.checkUnsavedGuard(() => {
      this.currentPassword = null;
      this.editor.setContent('');
      this.editor.setFile(null, false);
      this.updateToolbarState();
      Notification.show('Yeni metin belgesi oluşturuldu.', 'info');
    });
  }

  private async handleOpenFile(): Promise<void> {
    this.checkUnsavedGuard(async () => {
      try {
        const res = await ApiService.selectOpenFile();

        if (!res.success) {
          Notification.show(res.error, 'error');
          return;
        }

        if (!res.data) {
          return; // Selection canceled by user
        }

        const { filePath, header } = res.data;

        // Open password prompt to decrypt chosen file
        this.passwordModal.show({
          mode: 'unlock',
          title: 'Şifreli Dosyayı Aç',
          description: `"${filePath.split(/[/\\]/).pop()}" dosyasını açmak için anahtar şifreyi girin.`,
          onSubmit: async (key: string) => {
            const result = await ApiService.decryptContent(header, key);

            if (!result.success) {
              this.passwordModal.showError(result.error);
              return false;
            }

            // Successfully decrypted!
            this.currentPassword = key;
            this.editor.setContent(result.data.plaintext);
            this.editor.setFile(filePath, true);
            this.updateToolbarState();
            Notification.show('Şifreli dosya başarıyla açıldı.', 'success');
            return true;
          }
        });
      } catch (err: any) {
        Notification.show(err.message || 'Dosya açılırken bir hata oluştu.', 'error');
      }
    });
  }

  private async handleSaveFile(): Promise<void> {
    const content = this.editor.getContent();

    if (content.trim().length === 0) {
      Notification.show('Şifrelenecek metin boş olamaz.', 'error');
      return;
    }

    const state = this.editor.getState();
    let savePath = state.currentPath;

    try {
      // Step 1: If document is new, prompt OS save dialog first
      if (!savePath) {
        const pathRes = await ApiService.selectSaveFile('belge.slock');
        if (!pathRes.success) {
          Notification.show(pathRes.error, 'error');
          return;
        }
        if (!pathRes.data) {
          return; // User cancelled OS save dialog
        }
        savePath = pathRes.data;
      }

      // Step 2: If active password exists in session, encrypt directly with existing password!
      if (this.currentPassword) {
        const encRes = await ApiService.encryptContent(content, this.currentPassword);
        if (!encRes.success) {
          Notification.show(encRes.error, 'error');
          return;
        }

        const writeRes = await ApiService.writeEncryptedFile(savePath, encRes.data);
        if (!writeRes.success) {
          Notification.show(writeRes.error, 'error');
          return;
        }

        this.editor.setFile(savePath, true);
        this.updateToolbarState();
        Notification.show('Metin mevcut şifre ile güncellendi ve kaydedildi.', 'success');
        return;
      }

      // Step 3: No active password (new file), ask for key via modal
      const fileName = savePath.split(/[/\\]/).pop() || 'belge.slock';
      this.passwordModal.show({
        mode: 'encrypt',
        title: 'Metni Şifrele & Kaydet',
        description: `"${fileName}" dosyasını korumak için bir şifre anahtarı girin.`,
        onSubmit: async (key: string) => {
          // Encrypt content with key
          const encRes = await ApiService.encryptContent(content, key);
          if (!encRes.success) {
            this.passwordModal.showError(encRes.error);
            return false;
          }

          // Save encrypted header payload to file
          const writeRes = await ApiService.writeEncryptedFile(savePath!, encRes.data);
          if (!writeRes.success) {
            this.passwordModal.showError(writeRes.error);
            return false;
          }

          this.currentPassword = key;
          this.editor.setFile(savePath!, true);
          this.updateToolbarState();
          Notification.show('Metin başarıyla şifrelendi ve kaydedildi!', 'success');
          return true;
        }
      });
    } catch (err: any) {
      Notification.show(err.message || 'Kaydetme işlemi sırasında hata oluştu.', 'error');
    }
  }

  private async handleChangePassword(): Promise<void> {
    const content = this.editor.getContent();

    if (content.trim().length === 0) {
      Notification.show('Şifrelenecek metin boş olamaz.', 'error');
      return;
    }

    const state = this.editor.getState();
    let savePath = state.currentPath;

    try {
      if (!savePath) {
        const pathRes = await ApiService.selectSaveFile('belge.slock');
        if (!pathRes.success) {
          Notification.show(pathRes.error, 'error');
          return;
        }
        if (!pathRes.data) {
          return;
        }
        savePath = pathRes.data;
      }

      const fileName = savePath.split(/[/\\]/).pop() || 'belge.slock';

      this.passwordModal.show({
        mode: 'encrypt',
        title: 'Şifreyi Değiştir',
        description: `"${fileName}" dosyası için yeni bir şifre anahtarı belirleyin.`,
        onSubmit: async (newKey: string) => {
          const encRes = await ApiService.encryptContent(content, newKey);
          if (!encRes.success) {
            this.passwordModal.showError(encRes.error);
            return false;
          }

          const writeRes = await ApiService.writeEncryptedFile(savePath!, encRes.data);
          if (!writeRes.success) {
            this.passwordModal.showError(writeRes.error);
            return false;
          }

          this.currentPassword = newKey;
          this.editor.setFile(savePath!, true);
          this.updateToolbarState();
          Notification.show('Şifre başarıyla değiştirildi ve dosya yeni şifreyle kaydedildi!', 'success');
          return true;
        }
      });
    } catch (err: any) {
      Notification.show(err.message || 'Şifre değiştirme işlemi sırasında hata oluştu.', 'error');
    }
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
