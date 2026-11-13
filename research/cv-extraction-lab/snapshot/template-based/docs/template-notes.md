# Template Pain Points & Usage Notes

This document collects practical usage details and pain points for each CV template used in this project, to allow subagents or parallel work to use them effectively.

## General Pain Points
- **No lorem ipsum**: Replace all placeholder text with plausible, realistic CV content. No placeholder filler allowed.
- **Explicit line breaks**: In templates with narrow columns (like vercanard), use explicit line breaks (e.g., `#linebreak()`) for bullet-style or point-like content. Do not let Typst merge them into a single paragraph.
- **No "(example)" labels**: Do not append "(example)" to company names, emails, links, or any other content. Use clean fictional names (e.g., `company.example.com`).
- **Content independent of template first**: Write the full MD content based on pre-CV and variability axes BEFORE fitting to template. Do not let template sections dictate content. If it can't fit later, rewrite the template wrapper, but initially the content should be realistic and varied.
- **Compilation**: Always compile from a project root where imports resolve correctly. Use the `typst` Python package with appropriate `root` parameter. Set `root` to the `template-based` directory or the template work directory to avoid path escape errors.
- **Local imports**: When using local template copies, update imports to point to local paths (e.g., `#import "lib.typ": *` instead of `@preview/...`). Use `fontawesome/lib.typ` from local copies.
- **Fonts**: Ensure required fonts are installed system-wide (`/usr/local/share/fonts/`) and cache is updated (`fc-cache -f -v`). For templates requiring Noto, Fira Sans, Inria Sans, Source Sans Pro, etc., substitute with available fonts (Liberation, DejaVu) if exact fonts are missing. Record the substitution.
- **Icons**: Font Awesome fonts are installed system-wide. Use local `fontawesome` package imports. Icons may require specific icon names (e.g., `"location-dot"`, `"envelope"`). For custom icons, use the package's API.
- **Images/Photos**: Use placeholder images from `https://placehold.co/` or similar if needed. Save as `.png` and ensure the path is correct relative to the compilation root.

## Template-Specific Notes

### basic-resume:0.2.10
- **API**: Uses `resume.with(author, location, email, github, linkedin, phone, personal-site, accent-color, font, paper, author-position, personal-info-position)`.
- **Sections**: Uses `== Section` headings, `#edu(...)`, `#work(...)`, `#project(...)`, `#extracurriculars(...)`, `#generic-two-by-two(...)`, `#generic-one-by-two(...)`.
- **Pain points**: Requires `dates-helper(start-date:, end-date:)`. Simple template, easy to use. Font substitution: use Liberation/DejaVu if needed.
- **Usage**: Straightforward; just fill content.

### rendercv:0.3.0
- **API**: Uses `rendercv.with(name, title, footer, top-note, locale-catalog-language, page-size, page-top-margin, ..., colors-*, typography-*, header-*, section-titles-*, entries-*, links-*, date)`.
- **Sections**: Uses `= Name`, `#headline`, `#connections`, `== Section`, `#regular-entry`, `#education-entry`, `#project`, `#summary`, `#content-area`, `#reversed-numbered-entries`.
- **Icons**: Uses `#connection-with-icon(icon-name, content)` with Font Awesome icons. Requires Font Awesome fonts installed.
- **Pain points**: Many configuration options. Must use `#connection-with-icon` for icons in header. Requires `fontawesome` package (local copy).
- **Usage**: Rich but complex. Use the example `classic.typ` as reference.

### moderner-cv:0.2.2
- **API**: Uses `moderner-cv.with(name, lang, social, ...)`.
- **Sections**: Uses `= Section`, `#cv-entry`, `#cv-entry-multiline`, `#cv-double-item`, `#cv-list-double-item`, `#cv-line`.
- **Icons**: Supports Font Awesome icons via `social` dict (e.g., `website: ("link", "https://...", "display")`).
- **Pain points**: Requires `fontawesome` package. Image support via `#image` placed in content. Dates on left, content indented via `cv-entry-multiline`.
- **Usage**: Clean, modern look. Use `#cv-entry-multiline` for experience with dates left.

### jsume:0.1.0
- **API**: Uses `jsume.with(paper, top-margin, bottom-margin, left-margin, right-margin, font, nerd-font, font-size, lang, jsume-data)`.
- **Data**: Requires a JSON file matching jsume schema (`basics`, `work`, `education`, `skills`, `languages`, `certificates`, `awards`, etc.).
- **Pain points**: Must generate JSON data file. Uses `json("filename.jsume.json")`. Requires `pypdf` for text extraction (not relevant here). Font: Libertinus Serif (substitute with Liberation Serif).
- **Usage**: Data-driven. Generate JSON from content, then import.

### calligraphics:1.0.0
- **API**: Uses `resume(author, sidebar_content, main_content)` with two blocks.
- **Sections**: Uses `#aside-skill-item`, `#resume-entry`, `#resume-item`.
- **Pain points**: Requires `metalogo` package for LaTeX icon. Uses `lang.toml`. Two-column layout (sidebar + main). Requires `fontawesome` for icons.
- **Usage**: Elegant two-column layout. Use `#aside-skill-item` for sidebar skills.

### cobalt-cv:0.1.0
- **API**: Uses `resume.with(name, accent, sidebar-fill, sans-font, serif-font, col-ratio)` then content.
- **Sections**: Uses `#experience(company, role, location, dates, bullets)`, `#education(institution, location, dates, degrees)`, `#skill-category`, `#pill-list`.
- **Pain points**: Requires `fontawesome` for icons. Uses `#pill-list` for skill tags. Email escaping: use `\@` for `@` in email addresses.
- **Usage**: Bold header banner, sidebar. Use `#pill-list` for skills.

### monofolio:0.1.1
- **API**: Uses `resume.with(contact-info-position, contacts-separator, inline-separator, link-color, accent-color, font, font-size, line-spacing, entry-spacing, page-margin, list-marker, justify)`.
- **Sections**: Uses `#contact-info`, `#summary`, `#skillset`, `#experience`, `#project`, `#education`, `#certification`, then `#print-contact`, `#print-summary`, `#print-skills`, `#print-experience`, `#print-projects`, `#print-education`, `#print-certifications`.
- **Pain points**: Section order is controlled by print functions, not content order. Use `#print-*` to output sections.
- **Usage**: Modular, data-driven. Good for varied section order.

### vercanard:1.0.3
- **API**: Uses `resume.with(name, title, accent-color, margin, aside, body)`.
- **Sections**: Uses `#entry(title, body, details)` for each entry.
- **Pain points**: Narrow columns; requires explicit line breaks (`#linebreak()`) for readability. Use `#linebreak()` between bullet-like content. Font: Inria Sans (substitute with Liberation Sans).
- **Usage**: Simple, clean. Use `#linebreak()` for points.

### vivid-cv:0.2.0
- **API**: Uses `resume.with(author, title, font, email, github, linkedin, phone, location, personal-site, custom, about-title, about-beside, about-below, reference, header-color, name-color, heading-color, text-color, photo-border, author-font-size, font-size, paper, lang, icon, nb-lines-override, show-photo, photo, photo-size)`.
- **Sections**: Uses `#work(title, dates, company, location)`, `#edu(institution, dates, degree, location)`, `#project(role, name, url, dates)`, `#certificates(name, issuer, url, date)`, `#extracurriculars(activity, dates)`.
- **Pain points**: Requires `fontawesome` package. Photo support via `image("photo.png")`. Heading color must be explicitly set for readability (default yellow is hard to read). Use `#linebreak()` for skills/additional sections.
- **Usage**: Bold header banner, photo support. Set `heading-color` to dark shade.

### lavandula:0.1.1
- **API**: Uses `lavandula-theme.with(custom-colors)`, then `#cv(sidebar-position, sidebar-width, sidebar, main-content)`.
- **Sections**: Uses `#sidebar-section(title:, content)`, `#contact-list`, `#skill-group`, `#skill-levels`, `#section(title:, content)`, `#section-element(title:, info:, content)`, `#section-element-advanced(...)`.
- **Pain points**: Requires Fira Sans font and Font Awesome fonts. Uses `fontawesome` package. Complex sidebar/main layout. `#skill-levels` may not render in PDF (bug). Use `#icon-list` for bullet-like content.
- **Usage**: Very rich, modern. Use `#sidebar-section` and `#section` for content. Avoid `#skill-levels` if possible.

### vantage-cv:1.0.0
- **API**: Uses `vantage-cv(name, position, links, tagline, objective, jobs, education, technical_expertise, skills, methodology, tools, achievements)`.
- **Data**: Requires YAML configuration file (`configuration.yaml`).
- **Pain points**: Requires YAML file. Links must not be empty (use `https://maps.google.com/?q=...` for location). Uses `#skill(name, level)` for expertise. Uses `#styled-link` and `#term`.
- **Usage**: YAML-driven. Generate YAML from content. Use `#skill` for expertise levels.

### metronic:1.1.0
- **API**: Uses `theme(accent-color, background-color)`, then `resume-page.with(sidebar)`.
- **Sections**: Uses `#section(icon:, title:)` for each section. Sidebar uses `#contact`, `#tags`, `#medium`, `#small`.
- **Pain points**: Requires Font Awesome icons. Uses `#tags` for skill tags. Multi-page support via multiple `resume-page()` calls.
- **Usage**: Clean, professional. Use `#section` with icons.

### modern-cv:0.10.0 (experimental, not fully tested)
- **API**: Uses `resume.with(author, profile-picture, contact-items-separator, date, accent-color, colored-headers, show-footer, language, font, header-font, paper-size, use-smallcaps, show-address-icon, description, keywords)`.
- **Sections**: Uses `#resume-entry(title, location, date, description)`, `#resume-item(content)`.
- **Pain points**: Requires `author.positions` field. Uses `assets/profile.png` for profile picture. Includes `sections/*.typ` files. Font: Source Sans 3 (substitute with Liberation Sans). Complex author dict with many fields.
- **Usage**: Full-featured. Use `#resume-entry` and `#resume-item` for content.

## Variability Options (per docs)
- **Language**: English, Spanish, French (rotate/choose per pre-CV)
- **Seniority**: entry, junior, mid, senior, lead, specialist/trades
- **Sector**: IT, engineering, finance, management, sales, marketing, HR, skilled trades, specialists, misc
- **Origin/Education location**: different countries/cities
- **Availability**: full-time/part-time, shifts, notice period, relocation
- **Focus**: story-first, skill-first, credential-first, project-first, social/volunteer-first, no clear focus
- **Quality**: rough/impressionistic, generic, oddly specific, polished-but-vague
- **Profile type**: direct, career-changer, returner after gap, specialist, generalist
- **Completeness**: partial on purpose
- **Sections**: choose based on role/candidate, omit sections deliberately
- **Styling**: if template allows, vary colors, fonts, layout options (e.g., accent-color, header-color, sidebar-width, show-photo)
