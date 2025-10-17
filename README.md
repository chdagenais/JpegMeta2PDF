# JPEG Meta2PDF

Application web de conversion d'images JPEG vers PDF avec extraction et superposition automatique des métadonnées EXIF.

## 📋 Fonctionnalités

- ✅ **Interface intuitive** - Glisser-déposer (Drag & Drop) ou sélection de fichiers
- ✅ **Extraction automatique EXIF** - GPS et Date/Heure extraits via exif-js
- ✅ **Superposition des métadonnées** - Affichage en bas à droite de chaque image:
  - **Ligne 1**: Date et heure de prise de vue (48px - police grande)
  - **Ligne 2**: Coordonnées GPS latitude, longitude (24px)
- ✅ **Génération PDF professionnelle** - Une image par page avec jsPDF
- ✅ **Génération KMZ/Google Earth** - Fichier KMZ avec photos géolocalisées
- ✅ **Format Lettre US** - 8.5" × 11" (215.9 × 279.4 mm)
- ✅ **Orientation automatique** - Portrait ou paysage selon le ratio de l'image
- ✅ **100% Local** - Aucun serveur requis, traitement dans le navigateur
- ✅ **Sécurisé** - Aucune donnée envoyée en ligne
- ✅ **Compatible entreprise** - Fonctionne même avec proxys et certificats restrictifs

## 🚀 Installation et Utilisation

### Prérequis

Téléchargez les bibliothèques JavaScript requises :

```bash
# jsPDF - Génération de fichiers PDF
curl -o jspdf.min.js https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js

# exif-js - Extraction des métadonnées EXIF
curl -o exif-js.min.js https://cdn.jsdelivr.net/npm/exif-js/exif.min.js

# JSZip - Création de fichiers ZIP/KMZ
curl -o jszip.min.js https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
```

### Utilisation

1. **Ouvrir** - Lancez `index.html` dans votre navigateur web
2. **Sélectionner** - Déposez vos fichiers JPEG ou cliquez pour les choisir
3. **Générer PDF** - Cliquez sur "Générer PDF" pour créer un document PDF avec métadonnées superposées
4. **Générer KMZ** - Cliquez sur "Générer KMZ" pour créer un fichier Google Earth avec les photos géolocalisées
5. **Télécharger** - Les fichiers sont automatiquement téléchargés

## 🛠️ Architecture

```
JpegMeta2PDF/
├── index.html                # Interface utilisateur principale
├── app.js                    # Logique de l'application
├── jspdf.min.js             # Bibliothèque jsPDF (à télécharger)
├── exif-js.min.js           # Bibliothèque exif-js (à télécharger)
├── jszip.min.js             # Bibliothèque JSZip (à télécharger)
├── .gitignore               # Configuration Git
└── README.md                # Cette documentation
```

### Technologies utilisées

- **HTML5** - Interface et structure
- **CSS3** - Mise en forme et styles
- **JavaScript ES6+** - Logique métier
  - **FileReader API** - Lecture des fichiers locaux
  - **Canvas API** - Manipulation d'images et superposition de texte
  - **exif-js** - Extraction des métadonnées EXIF (GPS, date/heure)
  - **jsPDF** - Génération de fichiers PDF conformes
  - **JSZip** - Création de fichiers ZIP/KMZ

## 📝 Détails techniques

### Extraction des métadonnées EXIF

La bibliothèque **exif-js** extrait les données suivantes des fichiers JPEG :

- **Coordonnées GPS** - Latitude et longitude (si disponibles)
- **Date et heure** - DateTime, DateTimeOriginal ou DateTimeDigitized
- Conversion automatique des coordonnées GPS de DMS (Degrés, Minutes, Secondes) en DD (Degrés Décimaux)

### Superposition des métadonnées

Les métadonnées sont ajoutées directement sur l'image via Canvas :

- **Position** - Bas à droite de chaque image
- **Fond** - Rectangle noir semi-transparent (75% opacité) pour la lisibilité
- **Texte** - Police Arial Bold, couleur blanche
- **Hiérarchie visuelle** :
  - Ligne 1 : Date et heure (48px - grande taille pour mise en évidence)
  - Ligne 2 : Coordonnées GPS (24px - taille standard)
- **Marges** - 15px d'espacement autour du texte

### Génération PDF

Le PDF est créé avec **jsPDF** selon les spécifications suivantes :

- **Format** - Lettre US (8.5" × 11" / 215.9 × 279.4 mm)
- **Orientation dynamique** :
  - **Portrait** pour les images verticales (hauteur > largeur)
  - **Paysage** pour les images horizontales (largeur > hauteur)
- **Mise en page** - Images centrées avec marges de 10mm
- **Redimensionnement** - Automatique pour s'adapter à la page
- **Qualité** - JPEG 95% pour un bon compromis taille/qualité
- **Compatibilité** - PDF 1.4, lisible par tous les lecteurs PDF modernes

### Génération KMZ (Google Earth)

Le fichier KMZ est créé avec **JSZip** et contient :

- **Fichier KML** - Format XML standard pour données géospatiales
- **Images originales** - Stockées dans un dossier `files/` dans l'archive
- **Métadonnées** - Chaque point inclut :
  - Nom du fichier
  - Coordonnées GPS (latitude, longitude)
  - Date et heure de prise de vue
  - Informations sur l'appareil photo
  - Miniature de l'image
- **Filtrage automatique** - Seules les photos avec coordonnées GPS valides sont incluses
- **Compatible** - Ouvrable dans Google Earth, Google Maps, et tout logiciel supportant KML/KMZ

## 🔐 Sécurité et confidentialité

- ✅ **Traitement local uniquement** - Aucune donnée envoyée à un serveur
- ✅ **Aucune télémétrie** - Pas de tracking, cookies ou analytics
- ✅ **Trois dépendances uniquement** - jsPDF, exif-js et JSZip (bibliothèques open source)
- ✅ **Pas d'installation requise** - Fonctionne directement dans le navigateur
- ✅ **Compatible environnements restreints** - Fonctionne avec proxys d'entreprise et certificats auto-signés

## 📦 Dépendances

| Bibliothèque | Version | Licence | Usage |
|-------------|---------|---------|-------|
| **jsPDF** | 2.5.1 | MIT | Génération de fichiers PDF |
| **exif-js** | latest | MIT | Extraction métadonnées EXIF |
| **JSZip** | 3.10.1 | MIT/GPLv3 | Création de fichiers ZIP/KMZ |

### Liens de téléchargement

- **jsPDF** : https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
- **exif-js** : https://cdn.jsdelivr.net/npm/exif-js/exif.min.js
- **JSZip** : https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js

## 🌐 Compatibilité

### Navigateurs supportés

| Navigateur | Version minimale | Testé |
|-----------|------------------|-------|
| Chrome / Edge | 60+ | ✅ |
| Firefox | 55+ | ✅ |
| Safari | 11+ | ✅ |
| Opera | 47+ | ✅ |

### Fonctionnalités requises

- FileReader API
- Canvas API
- Blob API
- ES6+ JavaScript

## 📄 Licence

MIT License - Libre d'utilisation, modification et distribution

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add: Amazing Feature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 🐛 Rapporter un bug

Si vous trouvez un bug, veuillez ouvrir une issue avec :
- Description du problème
- Étapes pour reproduire
- Navigateur et version
- Captures d'écran si pertinent

## 💡 Améliorations futures possibles

- [ ] Support de formats de page supplémentaires (A4, Legal, etc.)
- [ ] Personnalisation de la position des métadonnées
- [ ] Choix des champs EXIF à afficher
- [ ] Prévisualisation avant génération
- [ ] Export des métadonnées en CSV
- [ ] Support de fichiers RAW (avec conversion)
- [ ] Mode batch avec dossiers complets

---

**Développé par** [chdagenais](https://github.com/chdagenais) | **Projet** [JpegMeta2PDF](https://github.com/chdagenais/JpegMeta2PDF)

