// kam-software-3d.js
// KAM.SOFTWARE 3D Geometry Utilities
// https://github.com/kam-uix/Geometry3D

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
    return new RoundedBoxGeometry(width, height, depth, segments, radius);
}
