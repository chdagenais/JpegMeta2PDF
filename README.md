# JPEG Meta2PDF

Convertisseur JPEG vers PDF avec extraction et superposition de métadonnées.

## 📋 Fonctionnalités

- ✅ Interface simple et intuitive (Drag & Drop)
- ✅ Extraction automatique des métadonnées EXIF
- ✅ Superposition des métadonnées sur les images (bas à droite)
- ✅ Génération de PDF multi-pages (1 image par page)
- ✅ **Une seule dépendance** - jsPDF (JavaScript pur)
- ✅ Fonctionne entièrement dans le navigateur
- ✅ Compatible avec tous les navigateurs modernes

## 🚀 Installation et Utilisation

### Télécharger jsPDF

Avant d'utiliser l'application, vous devez télécharger la bibliothèque jsPDF :

```bash
# Avec curl (PowerShell/Windows)
curl -o jspdf.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

# Ou avec wget (Linux/Mac)
wget -O jspdf.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
```

### Utilisation

1. Ouvrez le fichier `index.html` dans votre navigateur
2. Déposez vos fichiers JPEG ou cliquez pour les sélectionner
3. Cliquez sur "Générer PDF"
4. Le fichier PDF est automatiquement téléchargé

## 🧪 Générer des images de test

Pour tester l'application, utilisez le générateur d'images inclus :

1. Ouvrez `test/generate_images.html` dans votre navigateur
2. Cliquez sur les boutons "Télécharger" pour sauvegarder les images de test
3. Utilisez ces images dans l'application principale

## 🛠️ Architecture

```
JpegMeta2PDF/
├── index.html              # Interface utilisateur
├── app.js                  # Logique de l'application
├── jspdf.min.js           # Bibliothèque jsPDF (à télécharger)
├── .gitignore             # Configuration Git
├── README.md              # Documentation
└── test/
    └── generate_images.html  # Générateur d'images de test
```

### Technologie

- **HTML5**: Interface
- **CSS3**: Mise en forme
- **JavaScript ES6+**: Logique métier
  - FileReader API pour la lecture des fichiers
  - Canvas API pour la manipulation d'images et ajout de métadonnées
  - **jsPDF** pour la génération de PDF valides
  - ArrayBuffer pour le parsing EXIF

## 📝 Détails techniques

### Extraction EXIF

L'application parse les segments EXIF du fichier JPEG pour extraire:
- Fabricant de l'appareil
- Modèle d'appareil
- Date/Heure de prise de vue
- Logiciel utilisé
- Données GPS (si disponibles)

### Superposition des métadonnées

- Les métadonnées sont dessinées sur un Canvas
- Positionnées en bas à droite de chaque image
- Fond noir semi-transparent pour la lisibilité
- Texte blanc avec police Arial

### Génération PDF

Le PDF est généré avec jsPDF :
- Format A4 (210 × 297 mm)
- Images centrées et redimensionnées automatiquement
- Une image par page
- Compatible avec tous les lecteurs PDF

## 🔐 Sécurité

- ✅ Traitement local uniquement (aucun upload serveur)
- ✅ Une seule dépendance JavaScript (jsPDF)
- ✅ Pas de cookies ou session
- ✅ Compatible avec les environnements restrictifs (certificats d'entreprise, proxy, etc.)

## 📦 Dépendances

- **jsPDF v2.5.1** - Génération de fichiers PDF
  - Source: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
  - Licence: MIT

## 🌐 Compatibilité navigateur

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.
