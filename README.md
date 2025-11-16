# MARK INVEST TOUR Website Replica

This is a pixel-perfect replica of the website https://afisha.neverend.travel/

## What's Included

### ✅ Completed Features

1. **HTML Structure**: Complete HTML structure extracted and processed from the original website
2. **CSS Files**: All Tilda CMS CSS files downloaded and linked locally:
   - Tilda Grid system
   - Tilda Animation styles
   - Tilda Sliders styles
   - Tilda Cards styles
   - Tilda Popup styles
   - Tilda Forms styles
   - Swiper CSS

3. **JavaScript Libraries**: All required libraries downloaded and linked locally:
   - Lenis (smooth scrolling)
   - GSAP (animations)
   - ScrollTrigger (scroll-based animations)
   - Swiper (sliders/carousels)
   - jQuery
   - All Tilda CMS JavaScript modules

4. **Animations**: All GSAP animations preserved:
   - Hero section animations (headline, circle, travel grid)
   - Travel card scroll animations
   - Smooth scrolling with Lenis

5. **Sliders**: Swiper sliders for:
   - Preorder cards carousel
   - Navigation controls

6. **Images**: All image URLs replaced with local paths (images downloaded to `assets/images/`)

7. **Forms**: All form functionality preserved with Tilda Forms

8. **Modals/Popups**: Popup functionality for preorder forms

## File Structure

```
neverend-travel/
├── index.html              # Main HTML file (processed from original)
├── index_original.html     # Original downloaded HTML
├── assets/
│   ├── css/               # All CSS files
│   ├── js/                # All JavaScript files
│   └── images/            # All images
├── download_resources.ps1  # Script to download resources
├── download_tilda_resources.ps1  # Script to download Tilda resources
├── process_html_complete.ps1    # Script to process HTML
└── download_all_images.ps1      # Script to download images
```

## How to Use

1. **Open the website**: Simply open `index.html` in a web browser
2. **Local Server (Recommended)**: For best results, serve the files through a local web server:
   ```powershell
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Access**: Navigate to `http://localhost:8000` in your browser

## Features Replicated

- ✅ Hero section with animations
- ✅ Travel destination cards with hover effects
- ✅ Smooth scrolling (Lenis)
- ✅ GSAP scroll-triggered animations
- ✅ Swiper carousels
- ✅ Modal popups for forms
- ✅ Form functionality
- ✅ Responsive design
- ✅ All animations and interactions

## Notes

- All external URLs have been replaced with local paths
- Tracking scripts (Yandex Metrika, Google Tag Manager, etc.) are still present in the HTML but won't function without their respective services
- Some images may need to be downloaded if they weren't captured in the initial download
- The site uses Tilda CMS framework, so all Tilda-specific functionality is preserved

## Browser Compatibility

The site should work in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- CSS Flexbox
- Intersection Observer API

## Original Website

Original: https://afisha.neverend.travel/

