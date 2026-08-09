document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('photo-upload');

    if (!fileInput) return;

    fileInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        const options = {
            maxSizeMB: 1,          // Max size per image (MB)
            maxWidthOrHeight: 1920, // Max width or height in pixels
            useWebWorker: true,    // Runs compression in background thread (faster)
            fileType: 'image/webp' // Convert everything to efficient WebP format
        };

        const compressedFiles = [];
        
        // 1. Show a "processing" message (optional, good UX)
        fileInput.parentElement.classList.add('uploading');

        try {
            // 2. Compress each file
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                
                // Skip non-image files (just in case)
                if (!file.type.startsWith('image/')) {
                    compressedFiles.push(file);
                    continue;
                }

                console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                
                const compressedFile = await imageCompression(file, options);
                console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
                
                // We need to rename the file so the server knows it's a .webp
                const renamedFile = new File([compressedFile], file.name.split('.').slice(0, -1).join('.') + '.webp', {
                    type: 'image/webp',
                    lastModified: Date.now()
                });

                compressedFiles.push(renamedFile);
            }

            // 3. Replace the original file list with compressed ones
            const dataTransfer = new DataTransfer();
            compressedFiles.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;

        } catch (error) {
            console.error('Compression failed:', error);
            // Optionally alert the user, but the form will submit original files if this fails
        } finally {
            // 4. Remove "processing" message
            fileInput.parentElement.classList.remove('uploading');
        }
    });
});