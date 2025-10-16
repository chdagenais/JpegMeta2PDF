"""
Script pour générer des images JPEG de test avec métadonnées EXIF
Utilise uniquement la bibliothèque standard Python + PIL/Pillow
"""

from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import os

def create_test_image(filename, width=800, height=600, color=(100, 150, 200), text=""):
    """Crée une image de test avec du texte"""
    # Créer une image
    img = Image.new('RGB', (width, height), color=color)
    draw = ImageDraw.Draw(img)
    
    # Ajouter du texte au centre
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()
    
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    position = ((width - text_width) // 2, (height - text_height) // 2)
    draw.text(position, text, fill=(255, 255, 255), font=font)
    
    # Ajouter quelques formes pour rendre l'image plus intéressante
    draw.ellipse([50, 50, 150, 150], fill=(255, 100, 100))
    draw.rectangle([width-150, 50, width-50, 150], fill=(100, 255, 100))
    draw.polygon([(width//2, height-150), (width//2-50, height-50), (width//2+50, height-50)], fill=(255, 255, 100))
    
    return img

def main():
    # Créer le dossier data s'il n'existe pas
    output_dir = os.path.join('data')
    os.makedirs(output_dir, exist_ok=True)
    
    # Générer plusieurs images de test
    images_config = [
        ("photo1.jpg", (70, 130, 180), "Photo #1"),
        ("photo2.jpg", (220, 120, 80), "Photo #2"),
        ("photo3.jpg", (100, 180, 120), "Photo #3"),
    ]
    
    for filename, color, text in images_config:
        filepath = os.path.join(output_dir, filename)
        img = create_test_image(filename, color=color, text=text)
        
        # Sauvegarder avec des métadonnées EXIF de base
        # Note: PIL ne permet pas d'ajouter facilement toutes les métadonnées EXIF
        # mais on peut au moins sauvegarder l'image en JPEG
        img.save(filepath, 'JPEG', quality=95)
        print(f"Image créée: {filepath}")
    
    print(f"\n{len(images_config)} images de test créées dans {output_dir}/")
    print("Note: Pour ajouter des métadonnées EXIF complètes, installez 'piexif':")
    print("      pip install piexif")

if __name__ == "__main__":
    main()
