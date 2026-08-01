export interface IDialogService {
  showOpenFileDialog(): Promise<string | null>;
  showSaveFileDialog(defaultName?: string): Promise<string | null>;
}
