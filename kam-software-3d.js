// kam-software-3d.js
// KAM.SOFTWARE 3D Geometry Utilities
// https://github.com/kam-uix/Geometry3D

import * as THREE from 'three';

/**
 * Creates a box geometry with rounded edges (all 12 edges).
 *
 * @param {number} width    - Width (X axis)
 * @param {number} height   - Height (Y axis)
 * @param {number} depth    - Depth (Z axis)
 * @param {number} radius   - Rounding radius
 * @param {number} segments - Number of segments for the rounding
 * @returns {THREE.BufferGeometry}
 */
export function createRoundedBoxGeometry(width = 1, height = 1, depth = 1, radius = 0.1, segments = 4) {
    // Clamp the radius to half of the smallest dimension
    radius = Math.min(width / 2, height / 2, depth / 2, radius);

    // Number of segments must be odd for symmetry
    const seg = segments * 2 + 1;

    // Create a unit box with the specified number of segments
    const geometry = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);

    // Convert to non-indexed geometry so each face has independent vertices
    const posGeo = geometry.toNonIndexed();
    geometry.dispose();

    // If segments = 0, return a plain box
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

        // Scale to actual dimensions
        v3.x *= width;
        v3.y *= height;
        v3.z *= depth;

        // Determine which face this vertex belongs to based on its normal
        const absX = Math.abs(n3.x);
        const absY = Math.abs(n3.y);
        const absZ = Math.abs(n3.z);

        if (absX > absY && absX > absZ) {
            // X face
            closest.set(
                n3.x * innerWidth,
                THREE.MathUtils.clamp(v3.y, -innerHeight, innerHeight),
                THREE.MathUtils.clamp(v3.z, -innerDepth, innerDepth)
            );
        } else if (absY > absZ) {
            // Y face
            closest.set(
                THREE.MathUtils.clamp(v3.x, -innerWidth, innerWidth),
                n3.y * innerHeight,
                THREE.MathUtils.clamp(v3.z, -innerDepth, innerDepth)
            );
        } else {
            // Z face
            closest.set(
                THREE.MathUtils.clamp(v3.x, -innerWidth, innerWidth),
                THREE.MathUtils.clamp(v3.y, -innerHeight, innerHeight),
                n3.z * innerDepth
            );
        }

        // Vector from the closest point on the inner rectangle to the vertex
        const offset = v3.clone().sub(closest);
        const dist = offset.length();

        if (dist < radius && dist > 0) {
            // Push the vertex out to the rounded surface
            offset.normalize().multiplyScalar(radius - dist);
            v3.add(offset);
        }

        position.setXYZ(i, v3.x, v3.y, v3.z);
    }

    // Recompute normals for smooth shading
    posGeo.computeVertexNormals();

    return posGeo;
}
