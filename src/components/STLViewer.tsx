"use client";

import React, { useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

const STLViewer: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setFileUrl(blobUrl);
      setFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 text-white py-10">
      <h1 className="text-3xl font-bold mb-4">3D STL Viewer</h1>

      {/* Upload Box */}
      <label
        className="w-80 h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 transition-all"
      >
        <input
          type="file"
          accept=".stl"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <span className="text-gray-300">Drag & Drop STL File</span>
        <span className="text-sm text-gray-500">(or Click to Upload)</span>
      </label>

      {fileName && <p className="mt-2 text-sm text-gray-400">{fileName}</p>}

      {/* 3D Viewer */}
      <div className="w-full max-w-3xl h-[500px] mt-6 rounded-lg overflow-hidden shadow-lg bg-gray-800">
        <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          {fileUrl && <STLModel file={fileUrl} />}
          <OrbitControls autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>
    </div>
  );
};

interface STLModelProps {
  file: string;
}

const STLModel: React.FC<STLModelProps> = ({ file }) => {
  const geometry = useLoader(STLLoader, file);

  // Compute the bounding box for auto-centering
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  // Scale to fit view
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scaleFactor = 1.5 / maxDim;

  return (
    <mesh geometry={geometry} scale={[scaleFactor, scaleFactor, scaleFactor]}>
      <meshStandardMaterial color="white" metalness={0.5} roughness={0.3} />
    </mesh>
  );
};

export default STLViewer;
