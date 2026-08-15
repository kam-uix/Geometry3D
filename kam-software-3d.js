// kam-software-3d.js
// KAM.SOFTWARE 3D Geometry Utilities
// https://github.com/kam-uix/TWOJE_REPO

import * as THREE from 'three';

/**
 * Tworzy geometrię pudełka z zaokrąglonymi krawędziami (wszystkie 12).
 *
 * @param {number} width   - Szerokość (oś X)
 * @param {number} height  - Wysokość (oś Y)
 * @param {number} depth   - Głębokość (oś Z)
 * @param {number} radius  - Promień zaokrąglenia (przycinany do połowy najmniejszego wymiaru)
 * @param {number} segments - Liczba segmentów zaokrąglenia (im więcej, tym gładsze)
 * @returns {THREE.BufferGeometry} - Geometria z zaokrąglonymi krawędziami
 */
export function createRoundedBoxGeometry(width = 1, height = 1, depth = 1, radius = 0.1, segments = 4) {
    // Przycinamy promień do połowy najmniejszego wymiaru
    radius = Math.min(width / 2, height / 2, depth / 2, radius);

    // Liczba segmentów musi być nieparzysta dla symetrii (segments * 2 + 1)
    const seg = segments * 2 + 1;

    // Tworzymy pudełko jednostkowe z odpowiednią liczbą segmentów
    const geometry = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);

    // Konwertujemy na geometrię niezindeksowaną, aby każda ściana miała niezależne wierzchołki
    const posGeo = geometry.toNonIndexed();
    geometry.dispose();

    // Jeśli segments = 0, zwracamy zwykłe pudełko
    if (segments === 0) return posGeo;

    const position = posGeo.attributes.position;
    const normal = posGeo.attributes.normal;

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;
    const innerWidth = halfWidth - radius;
    const innerHeight = halfHeight - radius;
    const innerDepth = halfDepth - radius;

    const v3 = new THREE.Vector3();
    const n3 = new THREE.Vector3();
    const closest = new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
        v3.fromBufferAttribute(position, i);
        n3.fromBufferAttribute(normal, i);

        // Skalujemy do rzeczywistych wymiarów
        v3.x *= width;
        v3.y *= height;
        v3.z *= depth;

        // Określamy, która to ściana na podstawie normalnej
        const absX = Math.abs(n3.x);
        const absY = Math.abs(n3.y);
        const absZ = Math.abs(n3.z);

        if (absX > absY && absX > absZ) {
            // Ściana X
            closest.set(
                n3.x * innerWidth,
                THREE.MathUtils.clamp(v3.y, -innerHeight, innerHeight),
                THREE.MathUtils.clamp(v3.z, -innerDepth, innerDepth)
            );
        } else if (absY > absZ) {
            // Ściana Y
            closest.set(
                THREE.MathUtils.clamp(v3.x, -innerWidth, innerWidth),
                n3.y * innerHeight,
                THREE.MathUtils.clamp(v3.z, -innerDepth, innerDepth)
            );
        } else {
            // Ściana Z
            closest.set(
                THREE.MathUtils.clamp(v3.x, -innerWidth, innerWidth),
                THREE.MathUtils.clamp(v3.y, -innerHeight, innerHeight),
                n3.z * innerDepth
            );
        }

        // Wektor od najbliższego punktu na wewnętrznym prostokącie do wierzchołka
        const offset = v3.clone().sub(closest);
        const dist = offset.length();

        if (dist < radius && dist > 0) {
            // Wypychamy wierzchołek na zaokrągloną powierzchnię
            offset.normalize().multiplyScalar(radius - dist);
            v3.add(offset);
        }

        position.setXYZ(i, v3.x, v3.y, v3.z);
    }

    // Przeliczamy normalne dla gładkiego cieniowania
    posGeo.computeVertexNormals();

    return posGeo;
}
