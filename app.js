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
        // Créer un PDF simple en utilisant Canvas et la conversion en DataURL
        const pdfDoc = new SimplePDFGenerator();
        
        for (let i = 0; i < images.length; i++) {
            const imageData = images[i];
            await pdfDoc.addPage(imageData.canvas, imageData.width, imageData.height);
        }
        
        const pdfBlob = pdfDoc.generate();
        this.downloadPDF(pdfBlob);
    }

    downloadPDF(pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `images_metadata_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * Générateur PDF simple utilisant uniquement les APIs natives
 */
class SimplePDFGenerator {
    constructor() {
        this.pages = [];
        this.objectId = 1;
    }
    
    async addPage(canvas, width, height) {
        // Convertir le canvas en image base64
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const imageData = imageDataUrl.split(',')[1]; // Retirer le préfixe data:image/jpeg;base64,
        
        this.pages.push({
            imageData: imageData,
            width: width,
            height: height
        });
    }
    
    generate() {
        const pageWidth = 595.28; // A4 width in points (210mm)
        const pageHeight = 841.89; // A4 height in points (297mm)
        
        // Construction du PDF
        const pdfLines = [];
        pdfLines.push('%PDF-1.4');
        
        let nextObjId = 1;
        const offsets = [0]; // Offset 0 pour l'objet 0 (non utilisé)
        
        // Objet 1: Catalog
        const catalogId = nextObjId++;
        offsets.push(this.calculateOffset(pdfLines));
        pdfLines.push(`${catalogId} 0 obj`);
        pdfLines.push('<< /Type /Catalog /Pages 2 0 R >>');
        pdfLines.push('endobj');
        
        // Réserver l'ID 2 pour Pages (sera écrit à la fin)
        const pagesId = nextObjId++;
        
        const pageObjIds = [];
        
        // Créer les objets pour chaque page
        for (let i = 0; i < this.pages.length; i++) {
            const page = this.pages[i];
            
            // Calculer les dimensions pour adapter l'image à la page A4
            let imgWidth = pageWidth - 40;
            let imgHeight = (page.height / page.width) * imgWidth;
            
            if (imgHeight > pageHeight - 40) {
                imgHeight = pageHeight - 40;
                imgWidth = (page.width / page.height) * imgHeight;
            }
            
            const xOffset = (pageWidth - imgWidth) / 2;
            const yOffset = (pageHeight - imgHeight) / 2;
            
            // Objet Image XObject
            const imageObjId = nextObjId++;
            const imageBytes = atob(page.imageData);
            
            offsets.push(this.calculateOffset(pdfLines));
            pdfLines.push(`${imageObjId} 0 obj`);
            pdfLines.push(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>`);
            pdfLines.push('stream');
            pdfLines.push(imageBytes);
            pdfLines.push('endstream');
            pdfLines.push('endobj');
            
            // Objet Content Stream (commandes de dessin)
            const contentObjId = nextObjId++;
            const contentStream = `q\n${imgWidth} 0 0 ${imgHeight} ${xOffset} ${yOffset} cm\n/Im${i} Do\nQ`;
            
            offsets.push(this.calculateOffset(pdfLines));
            pdfLines.push(`${contentObjId} 0 obj`);
            pdfLines.push(`<< /Length ${contentStream.length} >>`);
            pdfLines.push('stream');
            pdfLines.push(contentStream);
            pdfLines.push('endstream');
            pdfLines.push('endobj');
            
            // Objet Page
            const pageObjId = nextObjId++;
            pageObjIds.push(pageObjId);
            
            offsets.push(this.calculateOffset(pdfLines));
            pdfLines.push(`${pageObjId} 0 obj`);
            pdfLines.push(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjId} 0 R /Resources << /XObject << /Im${i} ${imageObjId} 0 R >> >> >>`);
            pdfLines.push('endobj');
        }
        
        // Objet 2: Pages
        offsets.push(this.calculateOffset(pdfLines));
        pdfLines.push(`${pagesId} 0 obj`);
        pdfLines.push(`<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${this.pages.length} >>`);
        pdfLines.push('endobj');
        
        // Table xref
        const xrefOffset = this.calculateOffset(pdfLines);
        pdfLines.push('xref');
        pdfLines.push(`0 ${offsets.length}`);
        pdfLines.push('0000000000 65535 f ');
        
        for (let i = 1; i < offsets.length; i++) {
            pdfLines.push(offsets[i].toString().padStart(10, '0') + ' 00000 n ');
        }
        
        // Trailer
        pdfLines.push('trailer');
        pdfLines.push(`<< /Size ${offsets.length} /Root ${catalogId} 0 R >>`);
        pdfLines.push('startxref');
        pdfLines.push(xrefOffset.toString());
        pdfLines.push('%%EOF');
        
        const pdfContent = pdfLines.join('\n');
        return new Blob([pdfContent], { type: 'application/pdf' });
    }
    
    calculateOffset(lines) {
        // Calculer l'offset en comptant tous les caractères + newlines
        return lines.reduce((sum, line) => sum + line.length + 1, 0);
    }
}

// Initialiser l'application au chargement du DOM
const app = new JpegMeta2PDF();
