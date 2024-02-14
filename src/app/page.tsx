"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import type { Point } from "face-api.js";

export default function Home() {
  let loaded = useRef(false);
  let [modelLoaded, setModelLoaded] = useState(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    init();

    async function init() {
      const faceapi = await import("face-api.js");
      await Promise.all([
        faceapi.loadSsdMobilenetv1Model("/models"),
        faceapi.loadFaceLandmarkModel("/models"),
        // faceapi.loadFaceRecognitionModel("/models"),
      ]);
      setModelLoaded(true);
    }
  }, []);

  let onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const faceapi = await import("face-api.js");

    let files = e.target.files;
    if (files && files[0]) {
      const img = await faceapi.bufferToImage(files[0]);
      let canvas = document.getElementById("canvas") as HTMLCanvasElement;

      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);

      const detectionsWithLandmarks = await faceapi
        .detectAllFaces(canvas)
        .withFaceLandmarks();
      detectionsWithLandmarks.forEach((v) => {
        let rightEye = v.landmarks.getRightEye();
        let leftEye = v.landmarks.getLeftEye();

        draw(rightEye);
        draw(leftEye);
      });
    }
  };

  return (
    <main className="dark flex min-h-screen flex-col items-center justify-between p-8">
      <img src="/biden.png" alt="" className="p-2 bg-white rounded-lg" />

      {modelLoaded && (
        <Button slot="label" asChild className="cursor-pointer m-8">
          <Label htmlFor="picture" className="text-[32px]">
            Bidenify me
            <Input
              id="picture"
              type="file"
              accept="image/*"
              className=" hidden "
              onChange={onFileChange}
            />
          </Label>
        </Button>
      )}
      <p></p>
      <canvas id="canvas" className="w-full"></canvas>
      <img src="eye.png" alt="" id="eye" className="invisible" />
    </main>
  );
}
function draw(points: Point[], scale = 6) {
  let x1 = Math.min(...points.map((p) => p.x));
  let y1 = Math.min(...points.map((p) => p.y));
  let x2 = Math.max(...points.map((p) => p.x));
  let y2 = Math.max(...points.map((p) => p.y));
  let dx = x2 - x1;
  let dy = y2 - y1;
  let cx = (x1 + x2) / 2;
  let cy = (y1 + y2) / 2;

  let canvas = document.getElementById("canvas") as HTMLCanvasElement;
  let ctx = canvas.getContext("2d");
  let eye = document.getElementById("eye") as HTMLImageElement;
  ctx!.drawImage(
    eye,
    cx - scale * dx,
    cy - scale * dy,
    dx * scale * 2,
    dy * scale * 2
  );
}
