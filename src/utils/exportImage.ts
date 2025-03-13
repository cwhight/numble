import html2canvas from 'html2canvas';

interface ExportOptions {
    filename?: string;
    backgroundColor?: string;
    scale?: number;
}

export const exportAsImage = async (
    element: HTMLElement,
    options: ExportOptions = {}
): Promise<void> => {
    const {
        filename = 'exported-image',
        backgroundColor = '#ffffff',
        scale = 2
    } = options;

    try {
        const canvas = await html2canvas(element, {
            backgroundColor,
            scale,
            logging: false,
            useCORS: true
        });

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.download = `${filename}.jpg`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Error exporting image:', error);
        throw error;
    }
}; 