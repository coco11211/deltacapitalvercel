#!/usr/bin/env python3
"""
Generate favicon and image assets for Delta Capital website
"""
import os
from PIL import Image, ImageDraw
import json

# Create img directory if it doesn't exist
img_dir = os.path.join(os.path.dirname(__file__), 'img')
os.makedirs(img_dir, exist_ok=True)

def create_delta_triangle(size, bg_color='white', fg_color='black'):
    """Create a Delta (triangle) icon PNG"""
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Define triangle points (equilateral-ish)
    padding = size * 0.1
    top = padding
    bottom = size - padding
    left = padding
    right = size - padding

    # Triangle points: top center, bottom left, bottom right
    points = [
        (size / 2, top),      # top center
        (left, bottom),        # bottom left
        (right, bottom)        # bottom right
    ]

    # Parse color
    if fg_color == 'black':
        fill_color = (17, 17, 17, 255)  # #111
    else:
        fill_color = (255, 255, 255, 255)

    draw.polygon(points, fill=fill_color)
    return img

def create_og_image():
    """Create OpenGraph image (1200x630px)"""
    img = Image.new('RGB', (1200, 630), (250, 250, 250))  # #fafafa
    draw = ImageDraw.Draw(img)

    # Draw Delta triangle (centered, 200px height)
    triangle_size = 200
    x_offset = (1200 - triangle_size) // 2
    y_offset = (200 - triangle_size) // 2

    points = [
        (600, y_offset),                           # top center
        (x_offset, y_offset + triangle_size),      # bottom left
        (x_offset + triangle_size, y_offset + triangle_size)  # bottom right
    ]

    draw.polygon(points, fill=(17, 17, 17))  # #111

    # Add text
    # Note: We use basic text rendering. For production, use external font
    try:
        from PIL import ImageFont
        # Try to use a system font
        try:
            font_large = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 48)
            font_small = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 32)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()

        # Draw "DELTA CAPITAL" text
        text_y = 350
        draw.text((600, text_y), "DELTA CAPITAL", fill=(17, 17, 17), font=font_large, anchor="mm")

        # Draw tagline
        tagline_y = 450
        draw.text((600, tagline_y), "Systematic conviction through mathematical discipline",
                 fill=(85, 85, 85), font=font_small, anchor="mm")
    except Exception as e:
        print(f"Note: Could not render text: {e}")

    return img

def create_logo_png():
    """Create logo.png (512x512px) - Delta triangle on white"""
    img = Image.new('RGB', (512, 512), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Delta triangle 70% of canvas
    triangle_size = int(512 * 0.7)
    padding = (512 - triangle_size) // 2

    points = [
        (256, padding),                    # top center
        (padding, padding + triangle_size),  # bottom left
        (padding + triangle_size, padding + triangle_size)  # bottom right
    ]

    draw.polygon(points, fill=(17, 17, 17))  # #111
    return img

def create_favicon_ico():
    """Create favicon.ico with multiple sizes"""
    # Create images for different sizes
    sizes = [16, 32, 48]
    images = []

    for size in sizes:
        img = create_delta_triangle(size, bg_color='white', fg_color='black')
        # Convert RGBA to RGB for ICO
        rgb_img = Image.new('RGB', (size, size), (255, 255, 255))
        rgb_img.paste(img, (0, 0), img)
        images.append(rgb_img)

    # Save as ICO with multiple sizes
    images[0].save(
        os.path.join(img_dir, 'favicon.ico'),
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48)]
    )

def main():
    print("Generating Delta Capital assets...")

    # 1. Create favicon variants (PNG)
    favicon_sizes = {
        'apple-touch-icon.png': 180,
        'apple-touch-icon-152x152.png': 152,
        'apple-touch-icon-120x120.png': 120,
        'android-chrome-192x192.png': 192,
        'android-chrome-512x512.png': 512,
    }

    for filename, size in favicon_sizes.items():
        img = create_delta_triangle(size, bg_color='white', fg_color='black')
        img.save(os.path.join(img_dir, filename), 'PNG')
        print(f"[OK] Created {filename} ({size}x{size})")

    # 2. Create favicon.ico
    create_favicon_ico()
    print("[OK] Created favicon.ico (16x16, 32x32, 48x48)")

    # 3. Create og-default.png
    og_img = create_og_image()
    og_img.save(os.path.join(img_dir, 'og-default.png'), 'PNG')
    print("[OK] Created og-default.png (1200x630)")

    # 4. Create logo.png
    logo_img = create_logo_png()
    logo_img.save(os.path.join(img_dir, 'logo.png'), 'PNG')
    print("[OK] Created logo.png (512x512)")

    # 5. Create manifest.json
    manifest = {
        "name": "Delta Capital",
        "short_name": "Delta",
        "description": "Delta Capital - Quantitative Investment Management",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#fafafa",
        "theme_color": "#111111",
        "orientation": "portrait-primary",
        "icons": [
            {
                "src": "/img/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
            },
            {
                "src": "/img/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any"
            }
        ]
    }

    with open(os.path.join(img_dir, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=2)
    print("[OK] Created manifest.json")

    print("\nAll assets generated successfully!")

if __name__ == '__main__':
    main()
