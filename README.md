# Workplace Wellbeing

A responsive, single-page website for the psychologist-led workplace assessment and wellbeing service described in `functionality.md`. The monochrome design adapts the supplied reference to this service, with no dental content.

The site uses plain HTML, CSS, and JavaScript. There is no build step, package installation, or server application.

## Preview locally

Open `index.html` directly, or run this command from the project folder:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000`. Stop the server with Ctrl+C.

## Host on GitHub Pages

1. Sign in to GitHub and create a repository, for example `workplace-wellbeing`.
2. Choose **Add file → Upload files** and upload these files and folders to the repository root. Keep their names and folder structure:

   ```text
   index.html
   styles.css
   app.js
   config.js
   .nojekyll
   assets/
     favicon.svg
     images/
       workplace.jpg
     team/
       portrait-placeholder.svg
       amina-muazzam.jpg        ← your photo, when ready
   ```

3. Commit the uploaded files to the `main` branch. The entry file must be directly at the repository root, rather than inside another project folder.
4. Open the repository’s **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Choose **main** and **/(root)**, then click **Save**.
7. Once the deployment finishes, GitHub displays the live link in **Settings → Pages**. For the example repository it is `https://YOUR-USERNAME.github.io/workplace-wellbeing/`.
8. To update the site, replace or edit the same files and commit to `main`. GitHub Pages publishes those changes automatically.

All local asset paths are relative, so the site works both at a repository subpath and at a domain root. No Vite base-path setting or GitHub Actions configuration is needed.

Official hosting instructions: [Configure a GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Add Dr. Amina Muazzam’s photograph

1. Place her picture in `assets/team/`.
2. Name it **`amina-muazzam.jpg`**. The site automatically loads this file when present and uses the initials illustration until then.
3. If the filename or format is different, change `teamPhoto` in `config.js`, for example:

   ```js
   teamPhoto: 'assets/team/amina-muazzam.png',
   ```

4. Upload the photo and any changed `config.js` to GitHub. A portrait around 700 × 850 pixels works well. Adjust `.team-portrait img` in `styles.css` if you want to change the crop or remove the grayscale treatment.

The biography is based on [her official LCWU faculty profile](https://www.lcwu.edu.pk/prof-dr-amina-muazzam.html), consulted on 3 November 2026. It describes her academic position, qualifications, teaching areas, and international academic experience. The profile is linked from the team section.

## Customize the site

- **Organization name and content:** edit `index.html`. “Workplace Wellbeing” is the descriptive site name used throughout.
- **Enquiry address:** set `contactEmail` in `config.js` to your organization’s address. After a visitor prepares their enquiry, an **Open email** button opens their email app with the brief attached as message text.
- **Enquiry interaction:** the form validates required fields, displays a preview, and offers a `.txt` download or copy action. Entries remain in memory on the visitor’s device; the form does not store them or claim to have submitted them. No backend or form-provider account is required.
- **Assessment explorer:** edit the `areas` object in `app.js`. It includes all ten assessment modules described in the brief, grouped into five themes; background information is described separately.
- **Colors, spacing, and typography:** edit `styles.css`. DM Sans is loaded from Google Fonts with a system-font fallback. The photograph is stored locally.
- **Intro animation:** the counter appears once per tab session. Reduced-motion preferences disable it and the scroll reveals.

The site includes keyboard-operable assessment tabs, native menu and enquiry dialogs, expandable FAQs, responsive layouts, a skip link, and visible focus indicators.

## Image credit

Workplace photograph: [Unsplash image](https://images.unsplash.com/photo-1497366754035-f200968a6e72). The initials portrait and favicon are original SVG assets. Add your own authorized portrait in the team folder.

## Checks

Run `python tests/check_site.py` for local asset, section-link, and HTML checks. `tests/browser-check.html` is a browser interaction check: serve the project locally and open `http://localhost:8000/tests/browser-check.html`.
