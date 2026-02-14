# Manual Testing Guide

## How to Test the Planet Surface Feature

### Setup
1. Clone or pull the latest changes from the `copilot/add-simple-planet-surface` branch
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
   - You can open it directly: `file:///path/to/index.html`
   - Or use a local server: `python3 -m http.server 8000` and visit `http://localhost:8000`

### Expected Visual Results

#### On Page Load
✅ **You should immediately see**:
- A blue spherical planet in the background
- The planet should be visible behind the "World of Light" UI card
- The planet should have either:
  - An Earth-like texture with blue oceans and green/brown continents (if texture loaded)
  - OR a solid deep blue color (if texture didn't load)

✅ **The planet should be clearly recognizable** as a globe/world, not just floating lights

✅ **Layering from back to front**:
1. Black starry background
2. **Blue planet sphere** (NEW - solid and opaque)
3. Subtle golden inner glow
4. Dark wireframe grid lines
5. Golden light dots pulsing on the surface
6. Outer atmospheric glow
7. UI overlay on top

#### During Interaction
✅ **When you submit a prayer**:
- A new golden light appears on the planet surface
- Light burst animation plays
- Ripple wave expands
- Globe rotation speeds up briefly
- **Planet surface remains visible throughout** the animation

✅ **Rotation behavior**:
- The planet, wireframe, and lights all rotate together as one unit
- The planet texture (if loaded) rotates with the sphere
- Smooth, continuous rotation

✅ **Breathing animation**:
- The entire globe group (including planet) scales subtly up and down
- Creates a living, organic feel

### What Should NOT Change

❌ **These should work exactly as before**:
- Prayer submission form and UI
- Light count in top-right corner
- New light creation on prayer submission
- Burst particle animation
- Ripple wave effect
- Light dot pulsing/breathing
- Character counter
- Thank you screen
- Recent intentions panel

### Verification Checklist

- [ ] Planet surface is visible immediately on page load
- [ ] Planet appears blue (textured or solid color)
- [ ] Planet reads as a globe/world, not abstract
- [ ] Wireframe grid is visible ON TOP of planet
- [ ] Light dots are visible ON TOP of everything
- [ ] Planet rotates with the globe group
- [ ] Planet breathes (scales) with the globe group
- [ ] Submit prayer creates new light on planet
- [ ] Burst and ripple animations work correctly
- [ ] No JavaScript errors in console
- [ ] Page loads and functions properly

### Browser Console

Check the browser console (F12 or Cmd+Option+I):
- If you see: `"Using fallback blue planet color"` - texture failed to load, using blue color (OK)
- No message - texture loaded successfully (OK)
- JavaScript errors - something is wrong (report issue)

### Visual Comparison

**Before** (original):
- Floating lights with wireframe grid
- No solid surface visible
- Abstract, hard to recognize as a planet

**After** (with planet surface):
- Clear blue planet/globe
- Lights appear to be ON the planet surface
- Immediately recognizable as a world/planet
- More grounded and tangible feel

### Troubleshooting

**Issue**: Planet not visible
- Check browser console for errors
- Ensure Three.js CDN is not blocked
- Try clearing cache and reloading

**Issue**: Texture not loading
- This is OK! Fallback blue color should show
- Check network tab to see if texture request was blocked
- Planet should still be solid blue and visible

**Issue**: Lights not visible
- Check if they're behind the planet (they shouldn't be)
- Look for JavaScript errors
- Verify light count shows numbers > 0
