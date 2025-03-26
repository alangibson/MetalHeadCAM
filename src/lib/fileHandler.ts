export class FileHandler implements App.FileHandler {
    private fileButton: HTMLElement | null = null;
    private fileInput: HTMLInputElement | null = null;

    public initializeFileHandlers(): void {
        document.addEventListener('DOMContentLoaded', () => {
            this.fileButton = document.getElementById('file-button');
            this.fileInput = document.getElementById('file-input') as HTMLInputElement;
            
            if (!this.fileButton || !this.fileInput) {
                console.error('Required elements not found');
                return;
            }

            this.fileButton.addEventListener('click', () => {
                this.fileInput?.click();
            });

            this.fileInput.addEventListener('change', (e: Event) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                    this.handleFileSelection(file);
                }
            });
        });
    }

    public handleFileSelection(file: File): void {
        // Dispatch a custom event with the file
        const event = new CustomEvent('dxf-file-selected', { 
            detail: file,
            bubbles: true 
        });
        document.dispatchEvent(event);
    }
} 