/**
 * JPEG Meta2PDF - Application de conversion JPEG vers PDF avec métadonnées
 * Utilise exif-js pour l'extraction EXIF et jsPDF pour la génération PDF
 */

// Fonction helper pour convertir DMS (Degrees, Minutes, Seconds) en DD (Decimal Degrees)
function convertDMSToDD(dms, ref) {
    if (!dms || dms.length !== 3) return 0;
    
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    
    let dd = degrees + minutes / 60 + seconds / 3600;
    
    if (ref === 'S' || ref === 'W') {
        dd = dd * -1;
    }
    
    return dd;
}

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
                    // Créer une image à partir du résultat du FileReader
                    const img = new Image();
                    
                    img.onload = async () => {
                        // Utiliser exif-js pour extraire les métadonnées
                        let exifData = {};
                        
                        try {
                            await new Promise((resolveExif) => {
                                EXIF.getData(img, function() {
                                    // Extraire les coordonnées GPS
                                    const lat = EXIF.getTag(this, 'GPSLatitude');
                                    const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
                                    const lon = EXIF.getTag(this, 'GPSLongitude');
                                    const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');
                                    
                                    if (lat && lon) {
                                        const latDecimal = convertDMSToDD(lat, latRef);
                                        const lonDecimal = convertDMSToDD(lon, lonRef);
                                        exifData.GPS = `${latDecimal.toFixed(6)}°, ${lonDecimal.toFixed(6)}°`;
                                    }
                                    
                                    // Extraire la date
                                    const dateTime = EXIF.getTag(this, 'DateTime') || 
                                                   EXIF.getTag(this, 'DateTimeOriginal') || 
                                                   EXIF.getTag(this, 'DateTimeDigitized');
                                    
                                    if (dateTime) {
                                        exifData.Date = dateTime;
                                    }
                                    
                                    resolveExif();
                                });
                            });
                        } catch (exifError) {
                            console.warn('Erreur extraction EXIF:', exifError);
                        }
                        
                        // Créer un canvas pour ajouter les métadonnées
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        
                        // Dessiner l'image
                        ctx.drawImage(img, 0, 0);
                        
                        // Ajouter les métadonnées en bas à droite
                        if (Object.keys(exifData).length > 0) {
                            const padding = 15;
                            const lineHeight = 35;
                            const fontSize = 24;
                            
                            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                            ctx.font = `bold ${fontSize}px Arial`;
                            
                            // Organiser les métadonnées : GPS ligne 1, Date ligne 2
                            const metaLines = [];
                            
                            // Ligne 1: Coordonnées GPS si disponibles
                            if (exifData.GPS) {
                                metaLines.push(exifData.GPS);
                            }
                            
                            // Ligne 2: Date et heure
                            if (exifData.Date) {
                                metaLines.push(exifData.Date);
                            }
                            
                            // Si on a des métadonnées à afficher
                            if (metaLines.length > 0) {
                                // Calculer la taille du rectangle de fond
                                const maxWidth = Math.max(...metaLines.map(line => ctx.measureText(line).width));
                                const rectHeight = metaLines.length * lineHeight + padding * 2;
                                const rectWidth = maxWidth + padding * 2;
                                
                                // Dessiner le fond semi-transparent
                                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                                ctx.fillRect(
                                    canvas.width - rectWidth - 15,
                                    canvas.height - rectHeight - 15,
                                    rectWidth,
                                    rectHeight
                                );
                                
                                // Dessiner le texte
                                ctx.fillStyle = 'white';
                                ctx.font = `bold ${fontSize}px Arial`;
                                metaLines.forEach((line, index) => {
                                    ctx.fillText(
                                        line,
                                        canvas.width - rectWidth - 15 + padding,
                                        canvas.height - rectHeight - 15 + padding + (index + 1) * lineHeight
                                    );
                                });
                            }
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
                        reject(new Error(`Impossible de charger l'image: ${file.name}`));
                    };
                    
                    // Charger l'image à partir des données du FileReader
                    img.src = e.target.result;
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error(`Erreur de lecture du fichier: ${file.name}`));
            
            // Lire le fichier comme Data URL pour éviter les problèmes de blob
            reader.readAsDataURL(file);
        });
    }

    async createPDF(images) {
        // Utiliser jsPDF pour créer le PDF
        const { jsPDF } = window.jspdf;
        
        // Format Lettre US (8.5 x 11 pouces = 215.9 x 279.4 mm)
        const letterWidth = 215.9;
        const letterHeight = 279.4;
        const margin = 10;
        
        let pdf = null;
        
        for (let i = 0; i < images.length; i++) {
            const imageData = images[i];
            
            // Déterminer l'orientation selon le ratio de l'image
            const imageRatio = imageData.width / imageData.height;
            const orientation = imageRatio > 1 ? 'landscape' : 'portrait';
            
            // Dimensions de la page selon l'orientation
            const pageWidth = orientation === 'landscape' ? letterHeight : letterWidth;
            const pageHeight = orientation === 'landscape' ? letterWidth : letterHeight;
            
            // Créer le PDF ou ajouter une page
            if (i === 0) {
                pdf = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: 'letter'
                });
            } else {
                pdf.addPage('letter', orientation);
            }
            
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
