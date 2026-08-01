export interface EditorState {
  currentPath: string | null;
  isEncrypted: boolean;
  isDirty: boolean;
}

export class Editor {
  private textarea: HTMLTextAreaElement;
  private lineNumbers: HTMLElement;
  private counterLines: HTMLElement;
  private counterWords: HTMLElement;
  private counterChars: HTMLElement;
  private currentFilenameBadge: HTMLElement;
  private fileStatusBadge: HTMLElement;
  private statusDot: HTMLElement;
  private statusText: HTMLElement;

  private state: EditorState = {
    currentPath: null,
    isEncrypted: false,
    isDirty: false
  };

  private onChangeCallbacks: Array<(state: EditorState) => void> = [];

  constructor() {
    this.textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    this.lineNumbers = document.getElementById('line-numbers')!;
    this.counterLines = document.getElementById('counter-lines')!;
    this.counterWords = document.getElementById('counter-words')!;
    this.counterChars = document.getElementById('counter-chars')!;
    this.currentFilenameBadge = document.getElementById('current-filename')!;
    this.fileStatusBadge = document.getElementById('file-status-badge')!;
    this.statusDot = this.fileStatusBadge.querySelector('.status-dot')!;
    this.statusText = this.fileStatusBadge.querySelector('.status-text')!;

    this.initEvents();
  }

  private initEvents(): void {
    this.textarea.addEventListener('input', () => {
      this.setDirty(true);
      this.updateCounters();
      this.updateLineNumbers();
    });

    this.textarea.addEventListener('scroll', () => {
      this.lineNumbers.scrollTop = this.textarea.scrollTop;
    });

    // Handle Tab key insertion nicely inside text area
    this.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        this.textarea.value = this.textarea.value.substring(0, start) + '  ' + this.textarea.value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        this.textarea.dispatchEvent(new Event('input'));
      }
    });
  }

  public getState(): EditorState {
    return { ...this.state };
  }

  public getContent(): string {
    return this.textarea.value;
  }

  public setContent(text: string): void {
    this.textarea.value = text;
    this.setDirty(false);
    this.updateCounters();
    this.updateLineNumbers();
  }

  public setFile(filePath: string | null, isEncrypted: boolean = false): void {
    this.state.currentPath = filePath;
    this.state.isEncrypted = isEncrypted;
    this.setDirty(false);
    this.updateBadges();
    this.textarea.focus();
  }

  public setDirty(dirty: boolean): void {
    this.state.isDirty = dirty;
    this.updateBadges();
    this.notifyState();
  }

  public onStateChange(callback: (state: EditorState) => void): void {
    this.onChangeCallbacks.push(callback);
  }

  private notifyState(): void {
    this.onChangeCallbacks.forEach(cb => cb(this.getState()));
  }

  private updateBadges(): void {
    const filename = this.state.currentPath 
      ? this.state.currentPath.split(/[/\\]/).pop() || 'dosya.slock'
      : 'Yeni Belge.slock';

    this.currentFilenameBadge.textContent = filename + (this.state.isDirty ? ' *' : '');

    this.fileStatusBadge.className = 'status-badge';
    if (this.state.isDirty) {
      this.fileStatusBadge.classList.add('status-unsaved');
      this.statusText.textContent = 'Kaydedilmedi';
    } else if (this.state.isEncrypted) {
      this.fileStatusBadge.classList.add('status-encrypted');
      this.statusText.textContent = 'Şifreli Açık';
    } else {
      this.statusText.textContent = 'Yeni Metin';
    }
  }

  private updateCounters(): void {
    const text = this.textarea.value;
    const lines = text.length === 0 ? 1 : text.split('\n').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const chars = text.length;

    this.counterLines.textContent = `Satır: ${lines}`;
    this.counterWords.textContent = `Kelime: ${words}`;
    this.counterChars.textContent = `Karakter: ${chars}`;
  }

  private updateLineNumbers(): void {
    const lines = this.textarea.value.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= Math.max(1, lines); i++) {
      numbersHtml += `${i}<br>`;
    }
    this.lineNumbers.innerHTML = numbersHtml;
    this.lineNumbers.scrollTop = this.textarea.scrollTop;
  }
}
