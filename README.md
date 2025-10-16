# JPEG Meta2PDF

Convertisseur JPEG vers PDF avec extraction et superposition de métadonnées.

## 📋 Fonctionnalités

- ✅ Interface simple et intuitive (Drag & Drop)
- ✅ Extraction automatique des métadonnées EXIF
- ✅ Superposition des métadonnées sur les images
- ✅ Génération de PDF multi-pages (1 image par page)
- ✅ **Aucune dépendance externe** - JavaScript pur
- ✅ Fonctionne entièrement dans le navigateur
- ✅ Compatible avec tous les navigateurs modernes

## 🚀 Utilisation

1. Ouvrez le fichier `index.html` dans votre navigateur
2. Déposez vos fichiers JPEG ou cliquez pour les sélectionner
3. Cliquez sur "Générer PDF"
4. Le fichier PDF est automatiquement téléchargé

## 🛠️ Architecture

```
JpegMeta2PDF/
├── index.html          # Interface utilisateur
├── app.js             # Logique de l'application
├── .gitignore         # Configuration Git
└── README.md          # Documentation
```

### Technologie

- **HTML5**: Interface
- **CSS3**: Mise en forme
- **JavaScript ES6+**: Logique métier
  - FileReader API pour la lecture des fichiers
  - Canvas API pour la manipulation d'images
  - Blob API pour la création de PDF
  - ArrayBuffer pour le parsing EXIF

## 📝 Détails techniques

### Extraction EXIF

L'application parse les segments EXIF du fichier JPEG pour extraire:
- Fabricant de l'appareil
- Modèle d'appareil
- Date/Heure de prise de vue
- Logiciel utilisé
- Données GPS (si disponibles)

### Génération PDF

Le PDF est généré en JavaScript natif en utilisant:
- Structure PDF conforme à la norme PDF 1.4
- Objets PDF pour les images et le texte
- Table de référence croisée (xref) pour la navigation

## 🔐 Sécurité

- ✅ Traitement local uniquement (aucun upload serveur)
- ✅ Aucune dépendance NPM requise
- ✅ Pas de cookies ou session
- ✅ Compatible avec les environnements restrictifs (certificats d'entreprise, proxy, etc.)

## 📦 Installation

Aucune installation requise! Clonez simplement le dépôt:

```bash
git clone https://github.com/your-username/JpegMeta2PDF.git
cd JpegMeta2PDF
```

Puis ouvrez `index.html` dans votre navigateur.

## 🌐 Compatibilité navigateur

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Opera 47+

## 📄 Licence

MIT

## 🤝 Contribution

Les contributions sont bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.
