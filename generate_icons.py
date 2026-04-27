from PIL import Image, ImageDraw
import os

def make_icon(size, path):
    img = Image.new("RGB", (size, size), "#0a0a0a")
    draw = ImageDraw.Draw(img)
    # Draw a simple house shape
    margin = size // 6
    # Roof triangle
    roof_points = [
        (size // 2, margin),
        (size - margin, size // 2),
        (margin, size // 2),
    ]
    draw.polygon(roof_points, fill="#e8ff5a")
    # House body
    body_top = size // 2
    body_left = margin + size // 8
    body_right = size - margin - size // 8
    body_bottom = size - margin
    draw.rectangle([body_left, body_top, body_right, body_bottom], fill="#e8ff5a")
    # Door
    door_w = (body_right - body_left) // 4
    door_h = (body_bottom - body_top) // 2
    door_x = (body_left + body_right) // 2 - door_w // 2
    door_y = body_bottom - door_h
    draw.rectangle([door_x, door_y, door_x + door_w, body_bottom], fill="#0a0a0a")
    img.save(path)
    print(f"Generated {path}")

os.makedirs("/home/claude/homemode/public", exist_ok=True)
make_icon(192, "/home/claude/homemode/public/icon-192.png")
make_icon(512, "/home/claude/homemode/public/icon-512.png")
print("Icons created!")
