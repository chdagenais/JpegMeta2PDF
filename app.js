/**
 * JPEG Meta2PDF - Application de conversion JPEG vers PDF avec métadonnées
 * Utilise uniquement les APIs natives du navigateur
 */

class JpegMeta2PDF {
    constructor() {
        this.files = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadSection = document.getElementById('uploadSection');
        const fileInput = document.getElementById('fileInput');
        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');

        // Gestion du clic sur la zone de dépôt
        uploadSection.addEventListener('click', () => fileInput.click());

        // Gestion du drag and drop
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });

        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('dragover');
        });

        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Gestion de la sélection de fichiers
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Boutons d'action
        generateBtn.addEventListener('click', () => this.generatePDF());
        clearBtn.addEventListener('click', () => this.clearFiles());
    }

    handleFiles(fileList) {
        const jpegFiles = Array.from(fileList).filter(file => 
            file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')
        );

        if (jpegFiles.length === 0) {
            this.showMessage('Veuillez sélectionner des fichiers JPEG', 'error');
            return;
        }

        this.files = jpegFiles;
        this.updateFilesList();
    }

    updateFilesList() {
        const filesContainer = document.getElementById('filesContainer');
        const filesList = document.getElementById('filesList');
        const generateBtn = document.getElementById('generateBtn');

        filesContainer.innerHTML = '';

        this.files.forEach((file, index) => {
            const sizeKB = (file.size / 1024).toFixed(2);
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <span class="file-icon">🖼️</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${sizeKB} KB</span>
                </div>
                <button class="remove-btn" onclick="app.removeFile(${index})">Supprimer</button>
            `;
            filesContainer.appendChild(fileItem);
        });

        filesList.style.display = this.files.length > 0 ? 'block' : 'none';
        generateBtn.disabled = this.files.length === 0;
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFilesList();
    }

    clearFiles() {
        this.files = [];
        document.getElementById('fileInput').value = '';
        this.updateFilesList();
        this.showMessage('', '');
    }

    showMessage(text, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = text;
        messageDiv.className = 'message';
        if (type) {
            messageDiv.classList.add(type);
        }
    }

    updateProgress(current, total, status) {
        const progressContainer = document.getElementById('progressContainer');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const statusText = document.getElementById('statusText');

        progressContainer.style.display = 'block';
        const percentage = Math.round((current / total) * 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
        statusText.textContent = status;
    }

    async generatePDF() {
        if (this.files.length === 0) return;

        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');
        generateBtn.disabled = true;
        clearBtn.disabled = true;

        try {
            this.showMessage('Traitement en cours...', 'info');

            const images = [];
            for (let i = 0; i < this.files.length; i++) {
                this.updateProgress(i, this.files.length, `Lecture de l'image ${i + 1}/${this.files.length}`);
                const imageData = await this.processImage(this.files[i]);
                images.push(imageData);
            }

            this.updateProgress(this.files.length, this.files.length, 'Génération du PDF...');
            await this.createPDF(images);

            this.showMessage('✓ PDF généré avec succès!', 'success');
            document.getElementById('progressContainer').style.display = 'none';
        } catch (error) {
            console.error('Erreur:', error);
            this.showMessage(`Erreur: ${error.message}`, 'error');
            document.getElementById('progressContainer').style.display = 'none';
        } finally {
            generateBtn.disabled = false;
            clearBtn.disabled = false;
        }
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const exifData = this.extractExifData(arrayBuffer);
                    
                    // Créer une image pour obtenir les dimensions
                    const img = new Image();
                    const imgUrl = URL.createObjectURL(file);
                    
                    img.onload = async () => {
                        URL.revokeObjectURL(imgUrl);
                        
                        // Créer un canvas pour ajouter les métadonnées
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        
                        // Dessiner l'image
                        ctx.drawImage(img, 0, 0);
                        
                        // Ajouter les métadonnées en bas à droite
                        if (Object.keys(exifData).length > 0) {
                            const padding = 10;
                            const lineHeight = 20;
                            const fontSize = 14;
                            
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                            ctx.font = `${fontSize}px Arial`;
                            
                            const metaLines = [];
                            for (const [key, value] of Object.entries(exifData)) {
                                metaLines.push(`${key}: ${value}`);
                            }
                            
                            // Calculer la taille du rectangle de fond
                            const maxWidth = Math.max(...metaLines.map(line => ctx.measureText(line).width));
                            const rectHeight = metaLines.length * lineHeight + padding * 2;
                            const rectWidth = maxWidth + padding * 2;
                            
                            // Dessiner le fond semi-transparent
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                            ctx.fillRect(
                                canvas.width - rectWidth - 10,
                                canvas.height - rectHeight - 10,
                                rectWidth,
                                rectHeight
                            );
                            
                            // Dessiner le texte
                            ctx.fillStyle = 'white';
                            ctx.font = `${fontSize}px Arial`;
                            metaLines.forEach((line, index) => {
                                ctx.fillText(
                                    line,
                                    canvas.width - rectWidth - 10 + padding,
                                    canvas.height - rectHeight - 10 + padding + (index + 1) * lineHeight
                                );
                            });
                        }
                        
                        // Convertir le canvas en blob JPEG
                        canvas.toBlob((blob) => {
                            resolve({
                                file: file,
                                exifData: exifData,
                                blob: blob,
                                width: img.width,
                                height: img.height,
                                canvas: canvas
                            });
                        }, 'image/jpeg', 0.95);
                    };
                    
                    img.onerror = () => {
                        URL.revokeObjectURL(imgUrl);
                        reject(new Error(`Impossible de charger l'image: ${file.name}`));
                    };
                    
                    img.src = imgUrl;
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error(`Erreur de lecture du fichier: ${file.name}`));
            reader.readAsArrayBuffer(file);
        });
    }

    extractExifData(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const exifData = {};

        // Parcourir le fichier JPEG pour trouver le segment EXIF
        let offset = 2; // Sauter le SOI (Start Of Image) marker 0xFFD8

        while (offset < view.byteLength) {
            const marker = view.getUint16(offset, false);
            offset += 2;

            // Vérifier si c'est un marqueur de segment valide
            if ((marker & 0xFF00) !== 0xFF00) {
                break;
            }

            // Si c'est le segment APP1 (EXIF)
            if (marker === 0xFFE1) {
                const length = view.getUint16(offset, false);
                offset += 2;

                // Vérifier la signature EXIF
                if (offset + 6 <= view.byteLength) {
                    const exifSignature = String.fromCharCode(
                        view.getUint8(offset),
                        view.getUint8(offset + 1),
                        view.getUint8(offset + 2),
                        view.getUint8(offset + 3),
                        view.getUint8(offset + 4),
                        view.getUint8(offset + 5)
                    );

                    if (exifSignature === 'Exif\0\0') {
                        const tiffOffset = offset + 6;
                        const exifDataExtracted = this.parseTIFF(view, tiffOffset);
                        Object.assign(exifData, exifDataExtracted);
                    }
                }
                offset += length - 2;
            } else if (marker === 0xFFDA) {
                // SOS (Start of Scan) - fin des métadonnées
                break;
            } else {
                // Autres segments
                const length = view.getUint16(offset, false);
                offset += length;
            }
        }

        return exifData;
    }

    parseTIFF(view, offset) {
        const exifData = {};
        
        try {
            // Déterminer l'ordre des octets (big-endian ou little-endian)
            const littleEndian = view.getUint16(offset, false) === 0x4949;
            offset += 2;

            // Vérifier la valeur magique TIFF (42)
            const magic = view.getUint16(offset, littleEndian);
            if (magic !== 42) {
                return exifData;
            }
            offset += 2;

            // Lire le décalage du premier IFD (Image File Directory)
            const ifdOffset = view.getUint32(offset, littleEndian);
            let ifdPos = offset - 4 + ifdOffset;

            // Lire les IFD
            exifData.entries = this.readIFD(view, ifdPos, littleEndian);

            // Extraire les métadonnées utiles
            const formattedData = {};
            for (const [tag, value] of Object.entries(exifData.entries)) {
                switch(tag) {
                    case '0x010f': // Fabricant
                        formattedData.Fabricant = value;
                        break;
                    case '0x0110': // Modèle
                        formattedData.Modèle = value;
                        break;
                    case '0x0132': // Date/Heure
                        formattedData.Date = value;
                        break;
                    case '0x0131': // Logiciel
                        formattedData.Logiciel = value;
                        break;
                    case '0x8825': // Géolocalisation
                        formattedData.GPS = value;
                        break;
                }
            }

            return formattedData;
        } catch (error) {
            console.warn('Erreur lors du parsing TIFF:', error);
            return exifData;
        }
    }

    readIFD(view, offset, littleEndian) {
        const entries = {};
        
        try {
            const numEntries = view.getUint16(offset, littleEndian);
            offset += 2;

            for (let i = 0; i < numEntries && offset < view.byteLength - 12; i++) {
                const tag = '0x' + view.getUint16(offset, littleEndian).toString(16).padStart(4, '0');
                offset += 2;

                const type = view.getUint16(offset, littleEndian);
                offset += 2;

                const count = view.getUint32(offset, littleEndian);
                offset += 4;

                const value = this.readIFDValue(view, offset, type, count, littleEndian);
                entries[tag] = value;

                offset += 4; // Passer au prochain IFD entry
            }
        } catch (error) {
            console.warn('Erreur lors de la lecture IFD:', error);
        }

        return entries;
    }

    readIFDValue(view, offset, type, count, littleEndian) {
        try {
            switch(type) {
                case 2: // ASCII
                    return String.fromCharCode.apply(null, new Uint8Array(view.buffer, offset, Math.min(count, 4)));
                case 3: // SHORT
                    return view.getUint16(offset, littleEndian);
                case 4: // LONG
                    return view.getUint32(offset, littleEndian);
                case 5: // RATIONAL
                    return view.getUint32(offset, littleEndian) / view.getUint32(offset + 4, littleEndian);
                default:
                    return 'N/A';
            }
        } catch (error) {
            return 'N/A';
        }
    }

    async createPDF(images) {
        // Utiliser jsPDF pour créer le PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const margin = 10;
        
        for (let i = 0; i < images.length; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            
            const imageData = images[i];
            
            // Convertir le canvas en image base64
            const imgDataUrl = imageData.canvas.toDataURL('image/jpeg', 0.95);
            
            // Calculer les dimensions pour adapter l'image à la page
            const maxWidth = pageWidth - (margin * 2);
            const maxHeight = pageHeight - (margin * 2);
            
            let imgWidth = maxWidth;
            let imgHeight = (imageData.height / imageData.width) * imgWidth;
            
            if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
                imgWidth = (imageData.width / imageData.height) * imgHeight;
            }
            
            const xOffset = (pageWidth - imgWidth) / 2;
            const yOffset = (pageHeight - imgHeight) / 2;
            
            // Ajouter l'image au PDF
            pdf.addImage(imgDataUrl, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
        }
        
        // Sauvegarder le PDF
        pdf.save(`images_metadata_${new Date().getTime()}.pdf`);
    }
}

// Initialiser l'application au chargement du DOM
const app = new JpegMeta2PDF();
