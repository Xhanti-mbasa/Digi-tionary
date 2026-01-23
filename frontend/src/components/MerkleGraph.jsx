import React, { useRef, useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

const MerkleGraph = ({ data }) => {
    const fgRef = useRef();
    const [useShader, setUseShader] = useState(true);

    const handleNodeClick = (node) => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        
        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    };

    return (
        <div className="relative w-full h-[600px] bg-black rounded-lg overflow-hidden border border-gray-700">
             <div className="absolute top-4 left-4 z-10 flex gap-4">
                <button 
                    onClick={() => setUseShader(!useShader)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition"
                >
                    Toggle Metallic Shader
                </button>
            </div>
            
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                nodeLabel="label"
                nodeColor={node => node.type === 'leaf' ? '#4CAF50' : '#2196F3'}
                backgroundColor="#00000000" // Transparent to show parent bg
                onNodeClick={handleNodeClick}
                nodeThreeObject={node => {
                    if (!useShader) return false; // Use default spheres

                    const geometry = new THREE.SphereGeometry(6, 32, 32);
                    const material = new THREE.MeshStandardMaterial({
                        color: node.type === 'leaf' ? 0x4CAF50 : 0x2196F3,
                        metalness: 1.0,
                        roughness: 0.2,
                        emissive: node.type === 'leaf' ? 0x1B5E20 : 0x0D47A1,
                        emissiveIntensity: 0.2
                    });
                    
                    return new THREE.Mesh(geometry, material);
                }}
            />
            
            {/* Ambient light for the 3D scene (outside of ForceGraph, but it manages its own lights, 
                so we rely on MeshStandardMaterial reacting to potential default lights or need to add lights to scene) 
            */}
        </div>
    );
};

export default MerkleGraph;
