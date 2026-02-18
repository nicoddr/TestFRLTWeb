/**
 * Map Renderer for France-Lituanie Platform
 * Dependencies: regions-geo.js (defines GEO_DATA)
 */

const MapRenderer = {
    idMap: {
        'Auvergne-Rhône-Alpes': 'auvergne-rhone-alpes',
        'Bourgogne-Franche-Comté': 'bourgogne-franche-comte',
        'Bretagne': 'bretagne',
        'Centre-Val de Loire': 'centre-val-de-loire',
        'Corse': 'corse',
        'Grand Est': 'grand-est',
        'Guadeloupe': 'guadeloupe',
        'Guyane': 'guyane',
        'Hauts-de-France': 'hauts-de-france',
        'Île-de-France': 'ile-de-france',
        'Martinique': 'martinique',
        'Mayotte': 'mayotte',
        'Normandie': 'normandie',
        'Nouvelle-Aquitaine': 'nouvelle-aquitaine',
        'Occitanie': 'occitanie',
        'Pays de la Loire': 'pays-de-la-loire',
        "Provence-Alpes-Côte d'Azur": 'paca',
        'La Réunion': 'reunion'
    },

    domTomIds: ['guadeloupe', 'guyane', 'martinique', 'mayotte', 'reunion'],

    project: function (lon, lat) {
        // Approx center of Metropolitan France
        const center_lon = 2.5;
        const center_lat_rad = 46.5 * Math.PI / 180;

        // Simple projection math
        const x = (lon - center_lon) * Math.cos(center_lat_rad);
        const y = -(lat - 46.5);
        return [x, y];
    },

    init: function (containerId, listId = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (typeof GEO_DATA === 'undefined') {
            container.innerHTML = '<p class="text-center">Données cartographiques non chargées.</p>';
            return;
        }

        this.renderSvg(container);
        this.attachHandlers(container);
    },

    renderSvg: function (container) {
        let min_x = Infinity, max_x = -Infinity;
        let min_y = Infinity, max_y = -Infinity;

        const features = [];

        GEO_DATA.features.forEach(feature => {
            const name = feature.properties.nom;

            // Normalize for comparison (remove accents, lowercase, dashes)
            // This handles potential encoding issues or minor spelling diffs
            const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/-/g, " ").replace(/'/g, " ");
            const normalizedName = normalize(name);

            let id = this.idMap[name];

            // Fallback lookup if direct match fails
            if (!id) {
                // Try to find a match in idMap
                const keys = Object.keys(this.idMap);
                const match = keys.find(k => normalize(k) === normalizedName);
                if (match) {
                    id = this.idMap[match];
                }
            }

            // Filter: Only Metropolitan France (Exclude DOM-TOM)
            if (!id || this.domTomIds.includes(id)) return;

            const geo_type = feature.geometry.type;
            let coords = feature.geometry.coordinates;
            let polygons = [];

            if (geo_type === 'Polygon') polygons = [coords];
            else if (geo_type === 'MultiPolygon') polygons = coords;

            const svg_poly_paths = [];

            polygons.forEach(poly => {
                const ring = poly[0];
                const pts = [];
                ring.forEach(pt => {
                    const [x, y] = this.project(pt[0], pt[1]);
                    pts.push([x, y]);
                    min_x = Math.min(min_x, x);
                    max_x = Math.max(max_x, x);
                    min_y = Math.min(min_y, y);
                    max_y = Math.max(max_y, y);
                });
                svg_poly_paths.push(pts);
            });

            features.push({ name, id, paths: svg_poly_paths });
        });

        // ViewBox
        const width = 600;
        const height = 600;
        const data_w = max_x - min_x;
        const data_h = max_y - min_y;
        const scale = Math.min(width / data_w, height / data_h) * 0.95;

        const dx = (width - data_w * scale) / 2 - min_x * scale;
        const dy = (height - data_h * scale) / 2 - min_y * scale;

        let svgHTML = `<svg viewBox="0 0 ${width} ${height}" class="france-map-svg">`;

        features.forEach(feat => {
            let d = "";
            feat.paths.forEach(pts => {
                pts.forEach((pt, i) => {
                    const sx = pt[0] * scale + dx;
                    const sy = pt[1] * scale + dy;
                    d += (i === 0 ? "M" : "L") + sx.toFixed(1) + "," + sy.toFixed(1);
                });
                d += "Z ";
            });
            svgHTML += `<path d="${d.trim()}" class="map-region" data-id="${feat.id}" data-name="${feat.name}"></path>`;
        });

        svgHTML += '</svg>';
        container.innerHTML = svgHTML;
    },

    attachHandlers: function (container) {
        // Create tooltip if not exists
        let tooltip = document.getElementById('map-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'map-tooltip';
            document.body.appendChild(tooltip); // Append to body for absolute positioning
        }

        const regions = container.querySelectorAll('.map-region');

        regions.forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                window.location.href = `region-detail.html?id=${id}`;
            });

            el.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX) + 'px';
                tooltip.style.top = (e.pageY - 30) + 'px'; // Offset up
                tooltip.textContent = el.dataset.name;
                tooltip.style.opacity = '1';
                tooltip.style.position = 'absolute'; // Ensure absolute
                tooltip.style.zIndex = '9999';
            });

            el.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }
};
