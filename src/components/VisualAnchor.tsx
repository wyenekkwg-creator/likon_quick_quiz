import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, RefreshCw, Layers, Volume2, Maximize2 } from "lucide-react";

interface VisualAnchorProps {
  animationType: string;
  factTitle: string;
}

export default function VisualAnchor({ animationType, factTitle }: VisualAnchorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const [caption, setCaption] = useState("");
  const [mousePos, setMousePos] = useState({ x: 150, y: 150, isDown: false });

  // Simulate video progress (0 to 100%) looping every 12 seconds
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 0.8; // loop takes around 12 seconds
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle caption updates based on time and type
  useEffect(() => {
    const sec = Math.floor((progress / 100) * 12);
    let cap = "";

    switch (animationType) {
      case "space_orbit":
        if (sec < 3) cap = "A dying giant star collapses under its own weight...";
        else if (sec < 7) cap = "Gravity becomes infinite, creating a Singularity!";
        else if (sec < 10) cap = "Event Horizon: Even light is pulled in forever.";
        else cap = "The cosmic space-time fabric bends into a dark void.";
        break;
      case "heart_beat":
        if (sec < 4) cap = "Systemic check: Initializing 3 fully active hearts.";
        else if (sec < 8) cap = "Hearts 1 & 2 pump blood specifically to the gills...";
        else cap = "Heart 3 distributes copper-rich blue blood to the body!";
        break;
      case "ancient_pyramid":
        if (sec < 4) cap = "Architects compile limestone blocks under precision angle.";
        else if (sec < 8) cap = "Binding paste of Jaggery, lime, and pulses applied.";
        else cap = "Crystallized organic compound creates unbreakable molecular bonds!";
        break;
      case "electric_spark":
        if (sec < 4) cap = "Thousands of electrocyte batteries aligning in series...";
        else if (sec < 8) cap = "Ion gates open simultaneously: 860 Volts discharge!";
        else cap = "Prey is instantly stunned in a rapid aquatic lightning bolt.";
        break;
      case "nature_forest":
        if (sec < 4) cap = "Wings flapping at 80 times per second in mid-air...";
        else if (sec < 8) cap = "Aerodynamic lift generated on both upstroke and downstroke!";
        else cap = "Perfect flight stabilization: Navigating backward with ease.";
        break;
      case "chemistry_bond":
        if (sec < 4) cap = "Silicon dioxide (Sand) heated past 1,700°C...";
        else if (sec < 8) cap = "Molecular crystal lattices shatter into liquid state.";
        else cap = "Amorphous Solid: Swift cooling locks atoms in transparent glass!";
        break;
      case "dna_helix":
        if (sec < 4) cap = "Mona Lisa painting scanned with modern multispectral tech.";
        else if (sec < 8) cap = "Centuries of delicate restoration and glaze erosion found...";
        else cap = "The mystery solved: Leonardo originally painted beautiful eyebrows!";
        break;
      default:
        cap = "Interactive simulation displaying visual physics model.";
    }
    setCaption(cap);
  }, [progress, animationType]);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let frame = 0;

    // Resize canvas internally to high-res
    const width = 450;
    const height = 280;
    canvas.width = width;
    canvas.height = height;

    // Initialize particles based on type
    if (animationType === "space_orbit") {
      for (let i = 0; i < 80; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: 40 + Math.random() * 120,
          speed: 0.02 + Math.random() * 0.03,
          size: 1 + Math.random() * 2,
          color: `hsl(${260 + Math.random() * 60}, 100%, 70%)`,
        });
      }
    } else if (animationType === "heart_beat") {
      particles = [
        { x: width / 4, y: height / 2 + 10, scale: 1, label: "GILL L" },
        { x: (3 * width) / 4, y: height / 2 + 10, scale: 1, label: "GILL R" },
        { x: width / 2, y: height / 2 - 20, scale: 1.2, label: "BODY" },
      ];
    } else if (animationType === "electric_spark") {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 2 + 1,
        });
      }
    } else if (animationType === "nature_forest") {
      // Hummingbird properties
      particles = [{ x: width / 2, y: height / 2, flapAngle: 0, hoverOffset: 0 }];
    } else if (animationType === "chemistry_bond") {
      // Atoms in glass state
      for (let i = 0; i < 24; i++) {
        particles.push({
          x: 40 + Math.random() * (width - 80),
          y: 40 + Math.random() * (height - 80),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 8 + Math.random() * 8,
          color: i % 2 === 0 ? "#22d3ee" : "#a855f7",
        });
      }
    } else if (animationType === "ancient_pyramid") {
      // Stone blocks
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: width / 2 + (Math.random() - 0.5) * 160,
          y: height - 20 - Math.random() * 120,
          size: 15 + Math.random() * 15,
          targetY: height - 20 - (i % 4) * 25,
          isGlued: Math.random() > 0.5,
        });
      }
    } else if (animationType === "dna_helix") {
      // Leonardo's brushstrokes
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          alpha: Math.random(),
          speed: 0.005 + Math.random() * 0.01,
        });
      }
    }

    const render = () => {
      frame++;
      // Clear with elegant dark background
      ctx.fillStyle = "#0c0a0f";
      ctx.fillRect(0, 0, width, height);

      // Subtle scanline / video filter overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        // Render animations based on type
        switch (animationType) {
          case "space_orbit": {
            // Render Black Hole vortex
            const bhX = mousePos.isDown ? mousePos.x : width / 2;
            const bhY = mousePos.isDown ? mousePos.y : height / 2;

            // Draw gravity waves
            ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
            for (let r = 20; r < 180; r += 30) {
              ctx.beginPath();
              ctx.arc(bhX, bhY, r + (frame % 30) * 1, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Draw swirling particles
            particles.forEach((p) => {
              p.angle += p.speed * (mousePos.isDown ? 1.8 : 1);
              // Gravity pull if mouse is near
              if (mousePos.isDown) {
                p.radius = p.radius * 0.98 + 15 * 0.02;
              } else {
                p.radius = p.radius * 0.995 + (Math.sin(frame * 0.01) * 20 + 70) * 0.005;
              }
              if (p.radius < 5) p.radius = 120 + Math.random() * 40;

              const px = bhX + Math.cos(p.angle) * p.radius;
              const py = bhY + Math.sin(p.angle) * p.radius;

              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(px, py, p.size, 0, Math.PI * 2);
              ctx.fill();
            });

            // Draw glowing singularity core
            const gradient = ctx.createRadialGradient(bhX, bhY, 2, bhX, bhY, 25);
            gradient.addColorStop(0, "#ffffff");
            gradient.addColorStop(0.2, "#000000");
            gradient.addColorStop(0.5, "#8b5cf6");
            gradient.addColorStop(0.8, "rgba(236, 72, 153, 0.3)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(bhX, bhY, 30, 0, Math.PI * 2);
            ctx.fill();

            // Caption display watermark
            ctx.fillStyle = "rgba(139, 92, 246, 0.4)";
            ctx.font = "10px monospace";
            ctx.fillText("SIMULATED COSMIC GRAVITY TENSOR", 20, 30);
            break;
          }

          case "heart_beat": {
            // Render 3 Octopus hearts beating
            const t = frame * 0.08;
            const heartRateMultiplier = mousePos.isDown ? 1.8 : 1;

            particles.forEach((h, index) => {
              // Heart shape scale using sine function
              const beat = 1 + Math.sin(t * heartRateMultiplier + index * 1.5) * 0.12;

              ctx.save();
              ctx.translate(h.x, h.y);
              ctx.scale(beat * 1.3, beat * 1.3);

              // Draw beautiful heart path
              ctx.fillStyle = index === 2 ? "#06b6d4" : "#2563eb"; // Body heart is cyan, gill hearts are blue
              ctx.beginPath();
              ctx.moveTo(0, -6);
              ctx.bezierCurveTo(-6, -12, -12, -6, -12, 0);
              ctx.bezierCurveTo(-12, 6, -6, 12, 0, 18);
              ctx.bezierCurveTo(6, 12, 12, 6, 12, 0);
              ctx.bezierCurveTo(12, -6, 6, -12, 0, -6);
              ctx.fill();

              // Heart shine
              ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
              ctx.beginPath();
              ctx.arc(-4, -4, 2, 0, Math.PI * 2);
              ctx.fill();

              // Blue blood glow
              ctx.shadowColor = "#3b82f6";
              ctx.shadowBlur = 10;
              ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(0, 0, 16, 0, Math.PI * 2);
              ctx.stroke();

              ctx.restore();

              // Labels
              ctx.fillStyle = "#93c5fd";
              ctx.font = "bold 9px monospace";
              ctx.textAlign = "center";
              ctx.fillText(h.label, h.x, h.y + 35);
            });

            // Blood vessel flow lines connecting hearts
            ctx.strokeStyle = "rgba(6, 182, 212, 0.3)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width / 4, height / 2 + 10);
            ctx.bezierCurveTo(width / 3, height / 2 - 10, width / 2.5, height / 2 - 20, width / 2, height / 2 - 20);
            ctx.moveTo((3 * width) / 4, height / 2 + 10);
            ctx.bezierCurveTo((2 * width) / 3, height / 2 - 10, (1.8 * width) / 2.5, height / 2 - 20, width / 2, height / 2 - 20);
            ctx.stroke();

            // Render blood flow pulse particles
            const flowOffset = (frame * 2) % 100;
            ctx.fillStyle = "#67e8f9";
            ctx.beginPath();
            ctx.arc(width / 4 + (width / 4) * (flowOffset / 100), height / 2, 3, 0, Math.PI * 2);
            ctx.arc((3 * width) / 4 - (width / 4) * (flowOffset / 100), height / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
            ctx.font = "10px monospace";
            ctx.textAlign = "left";
            ctx.fillText("OCTOPOD METABOLIC TRIPLE-HEART LOOP", 20, 30);
            break;
          }

          case "electric_spark": {
            // Render heavy electric bolts discharging
            const startX = 60;
            const startY = height / 2;
            const endX = width - 60;
            const endY = height / 2;

            // Draw eel battery terminals
            ctx.fillStyle = "#1e1b4b";
            ctx.strokeStyle = "#4338ca";
            ctx.lineWidth = 2;
            ctx.fillRect(20, height / 2 - 30, 40, 60);
            ctx.strokeRect(20, height / 2 - 30, 40, 60);
            ctx.fillRect(width - 60, height / 2 - 30, 40, 60);
            ctx.strokeRect(width - 60, height / 2 - 30, 40, 60);

            ctx.fillStyle = "#ec4899";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("+", 35, height / 2 + 5);
            ctx.fillStyle = "#06b6d4";
            ctx.fillText("-", width - 45, height / 2 + 5);

            // Draw electric eel outline glowing
            ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
            ctx.lineWidth = 15;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(30, height / 2);
            ctx.bezierCurveTo(width / 3, height / 2 - 40, (2 * width) / 3, height / 2 + 40, width - 30, height / 2);
            ctx.stroke();

            // Random jagged bolt
            if (frame % 3 === 0 || mousePos.isDown) {
              ctx.strokeStyle = "#67e8f9";
              ctx.lineWidth = 2 + Math.random() * 3;
              ctx.shadowColor = "#06b6d4";
              ctx.shadowBlur = 15;

              ctx.beginPath();
              ctx.moveTo(startX, startY);

              let currentX = startX;
              let currentY = startY;
              const segments = 10;
              const segmentWidth = (endX - startX) / segments;

              for (let i = 1; i <= segments; i++) {
                currentX += segmentWidth;
                currentY = height / 2 + (Math.random() - 0.5) * 60;
                if (i === segments) {
                  ctx.lineTo(endX, endY);
                } else {
                  ctx.lineTo(currentX, currentY);
                }
              }
              ctx.stroke();
              ctx.shadowBlur = 0; // Reset
            }

            // Floating sparks
            particles.forEach((p) => {
              p.x += p.vx * (mousePos.isDown ? 3 : 1);
              p.y += p.vy * (mousePos.isDown ? 3 : 1);
              if (p.x < 0 || p.x > width) p.vx *= -1;
              if (p.y < 0 || p.y > height) p.vy *= -1;

              ctx.fillStyle = "#f472b6";
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            });

            ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
            ctx.font = "10px monospace";
            ctx.fillText("BIOLOGICAL ELECTRICAL AMPERE OSCILLATION", 20, 30);
            break;
          }

          case "nature_forest": {
            // Hummingbird flying backwards and forwards
            const hb = particles[0];
            const flapSpeed = mousePos.isDown ? 0.8 : 0.4;
            hb.flapAngle += flapSpeed;
            hb.hoverOffset = Math.sin(frame * 0.1) * 8;

            // Target X position dynamically shifts or follows mouse
            const targetX = mousePos.isDown ? mousePos.x : width / 2 + Math.sin(frame * 0.02) * 50;
            hb.x = hb.x * 0.95 + targetX * 0.05;
            hb.y = hb.y * 0.95 + (height / 2 + hb.hoverOffset) * 0.05;

            // Draw a pretty glowing flower on the right
            ctx.fillStyle = "#f43f5e";
            ctx.beginPath();
            ctx.arc(width - 50, height / 2 + 10, 14, 0, Math.PI * 2);
            ctx.fill();
            // Flower stem
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(width - 50, height / 2 + 10);
            ctx.quadraticCurveTo(width - 40, height - 10, width - 60, height);
            ctx.stroke();

            // Render Hummingbird body
            ctx.save();
            ctx.translate(hb.x, hb.y);

            // Facing direction (always facing flower)
            const dir = hb.x < width - 50 ? 1 : -1;
            ctx.scale(dir, 1);

            // Tail
            ctx.fillStyle = "#047857";
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(-28, 8);
            ctx.lineTo(-25, -2);
            ctx.fill();

            // Wing 1 (Up/Down flap based on sin curve)
            ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
            ctx.save();
            ctx.translate(-2, -6);
            ctx.rotate(Math.sin(hb.flapAngle) * 0.9);
            ctx.beginPath();
            ctx.ellipse(0, -15, 6, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Body
            ctx.fillStyle = "#059669";
            ctx.beginPath();
            ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Red throat patch
            ctx.fillStyle = "#e11d48";
            ctx.beginPath();
            ctx.ellipse(8, -2, 6, 4, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = "#064e3b";
            ctx.beginPath();
            ctx.arc(12, -6, 7, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(14, -7, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Long thin Beak feeding
            ctx.strokeStyle = "#1f2937";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(18, -6);
            ctx.lineTo(38, -4);
            ctx.stroke();

            // Wing 2 (in foreground)
            ctx.fillStyle = "rgba(52, 211, 153, 0.5)";
            ctx.save();
            ctx.translate(0, -2);
            ctx.rotate(Math.sin(hb.flapAngle + Math.PI / 2) * 0.7);
            ctx.beginPath();
            ctx.ellipse(0, -12, 5, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.restore();

            ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
            ctx.font = "10px monospace";
            ctx.fillText("HIGH-FREQUENCY WING AERODYNAMICS", 20, 30);
            break;
          }

          case "chemistry_bond": {
            // Render melting silicon/sand into glass
            const meltFactor = mousePos.isDown ? 1.0 : (Math.sin(frame * 0.015) + 1) / 2;

            particles.forEach((p, index) => {
              // Liquid drift vs solid bond
              p.x += p.vx * (1 + meltFactor * 4);
              p.y += p.vy * (1 + meltFactor * 4);

              if (p.x < 20 || p.x > width - 20) p.vx *= -1;
              if (p.y < 20 || p.y > height - 20) p.vy *= -1;

              // Drawing connections (bonds) based on proximity
              particles.forEach((other, otherIndex) => {
                if (index === otherIndex) return;
                const dx = p.x - other.x;
                const dy = p.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 60) {
                  // Connect with glowing line
                  ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 - dist / 150})`;
                  ctx.lineWidth = 1.5 * (1 - meltFactor);
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(other.x, other.y);
                  ctx.stroke();
                }
              });

              // Atom orb
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = p.radius * meltFactor;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            });

            // Temperature scale representation
            ctx.fillStyle = `rgb(${Math.floor(100 + meltFactor * 155)}, 50, ${Math.floor(255 - meltFactor * 155)})`;
            ctx.font = "bold 11px monospace";
            ctx.fillText(`THERMO-ENERGY TEMP: ${Math.floor(800 + meltFactor * 900)}°C`, 20, height - 15);

            ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
            ctx.font = "10px monospace";
            ctx.fillText("SILICON MOLECULAR CRITICAL AMORPHOUS BONDING", 20, 30);
            break;
          }

          case "ancient_pyramid": {
            // Render rotating wireframe Taj Mahal dome / bonding blocks
            const cX = width / 2;
            const cY = height / 2 + 10;
            const rotSpeed = frame * 0.015;

            // Render a rotating wireframe architectural structure
            ctx.strokeStyle = "rgba(244, 63, 94, 0.25)";
            ctx.lineWidth = 1;

            // Draw base
            ctx.strokeRect(cX - 120, cY + 40, 240, 10);

            // Architectural grid dome outline
            ctx.save();
            ctx.translate(cX, cY + 40);
            ctx.scale(1.2, 1);
            for (let r = 0; r < Math.PI; r += Math.PI / 8) {
              const xPos = Math.cos(r + rotSpeed) * 60;
              ctx.beginPath();
              ctx.arc(xPos, -20, 40, Math.PI, 0);
              ctx.stroke();
            }
            ctx.restore();

            // Glowing central pinnacle spire
            ctx.strokeStyle = "#f43f5e";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cX, cY - 20);
            ctx.lineTo(cX, cY - 60);
            ctx.stroke();

            ctx.fillStyle = "#fb7185";
            ctx.beginPath();
            ctx.arc(cX, cY - 60, 4, 0, Math.PI * 2);
            ctx.fill();

            // Organic mortar bond block effect
            particles.forEach((block) => {
              if (block.isGlued) {
                // Glued block, stays locked in structure
                ctx.fillStyle = "rgba(16, 185, 129, 0.6)";
              } else {
                // Floating block sinking down to snap in
                block.y = block.y * 0.98 + block.targetY * 0.02;
                ctx.fillStyle = "rgba(251, 113, 133, 0.5)";
                if (Math.abs(block.y - block.targetY) < 1) {
                  block.isGlued = true;
                }
              }

              ctx.fillRect(block.x - 8, block.y - 6, 16, 12);
            });

            ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
            ctx.font = "10px monospace";
            ctx.fillText("STRUCTURAL CALCIUM-ORGANIC BONDING GRID", 20, 30);
            break;
          }

          case "dna_helix": {
            // DNA / brush strokes SCAN
            const lineY = (frame * 1.5) % height;

            particles.forEach((p) => {
              p.alpha += p.speed;
              if (p.alpha > 1) p.alpha = 0;

              ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
              ctx.fillRect(p.x, p.y, 4, 4);
            });

            // Active laser scan line showing the "eyebrows proof"
            ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
            ctx.lineWidth = 2;
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(0, lineY);
            ctx.lineTo(width, lineY);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw a stylish wireframe face outline with glowing eyebrows
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2); // Head
            ctx.stroke();

            // Eyes
            ctx.strokeRect(width / 2 - 25, height / 2 - 10, 15, 6);
            ctx.strokeRect(width / 2 + 10, height / 2 - 10, 15, 6);

            // Smiling lips
            ctx.beginPath();
            ctx.arc(width / 2, height / 2 + 15, 15, 0, Math.PI);
            ctx.stroke();

            // Restored original eyebrows glowing!
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(width / 2 - 32, height / 2 - 18);
            ctx.quadraticCurveTo(width / 2 - 20, height / 2 - 22, width / 2 - 10, height / 2 - 17);

            ctx.moveTo(width / 2 + 32, height / 2 - 18);
            ctx.quadraticCurveTo(width / 2 + 20, height / 2 - 22, width / 2 + 10, height / 2 - 17);
            ctx.stroke();

            ctx.fillStyle = "#f59e0b";
            ctx.font = "bold 9px monospace";
            ctx.fillText("RESTORED HIGH-RESOLUTION GLYPH SCAN", 20, height - 15);

            ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
            ctx.font = "10px monospace";
            ctx.fillText("MULTISPECTRAL RESTORATION EYE-GRID SCAN", 20, 30);
            break;
          }

          default: {
            // General grid physics visualization
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 30) {
              ctx.beginPath();
              ctx.moveTo(i, 0);
              ctx.lineTo(i, height);
              ctx.stroke();
            }
            for (let j = 0; j < height; j += 30) {
              ctx.beginPath();
              ctx.moveTo(0, j);
              ctx.lineTo(width, j);
              ctx.stroke();
            }
            break;
          }
        }
      } else {
        // Paused overlay state
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Paused - Tap to Resume", width / 2, height / 2);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, animationType, mousePos]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    setMousePos({ x, y, isDown: true });
    setIsInteractive(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mousePos.isDown) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    setMousePos((prev) => ({ ...prev, x, y }));
  };

  const handleMouseUpOrLeave = () => {
    setMousePos((prev) => ({ ...prev, isDown: false }));
    setTimeout(() => setIsInteractive(false), 800);
  };

  const restartVideo = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="w-full bg-slate-950 border-2 border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header Watermark */}
      <div className="px-4 py-3 bg-black border-b-2 border-white/10 flex items-center justify-between text-[11px] font-bold text-white/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="tracking-wide">D-LIKON CORE VIRTUAL ANCHOR</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <Volume2 className="w-3.5 h-3.5" /> Web-TTS Ready
          </span>
          <span className="bg-white/15 px-2 py-0.5 rounded text-white text-[9px] uppercase font-black tracking-wider">
            {animationType.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Interactive Video Screen Container */}
      <div className="relative group aspect-[16/10] bg-[#0c0a0f] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full h-full cursor-pointer touch-none"
        />

        {/* Dynamic Interactive Ripple Guide Overlay */}
        {isInteractive && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-black font-sans font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded shadow-lg pointer-events-none animate-bounce">
            ⚡ INTERACTING WITH VECTOR FIELD
          </div>
        )}

        {!isInteractive && (
          <div className="absolute top-3 right-3 bg-black/80 text-white/80 font-mono text-[9px] px-2.5 py-1 rounded pointer-events-none transition-opacity opacity-0 group-hover:opacity-100">
            🖱️ Drag/tap on viewport to interact
          </div>
        )}

        {/* Caption Overlay */}
        <div className="absolute bottom-16 left-4 right-4 bg-black/90 border-2 border-white/10 p-3.5 rounded-xl backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-none">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Live Fact Analysis Transcript
          </div>
          <p className="text-xs text-white/95 leading-relaxed font-sans font-medium transition-all duration-300">
            {caption}
          </p>
        </div>

        {/* Overlay Center Play Button (When Paused) */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            id="play_button_overlay"
            className="absolute inset-0 m-auto w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center shadow-2xl transition-transform transform active:scale-95 duration-200"
          >
            <Play className="w-6 h-6 fill-current ml-1" />
          </button>
        )}
      </div>

      {/* Video Control Bar */}
      <div className="px-4 py-3.5 bg-black border-t-2 border-white/10 flex flex-col gap-2.5">
        {/* Timeline Slider Progress Bar */}
        <div className="flex items-center gap-3 w-full">
          <span className="text-[10px] font-bold text-white/50 w-8">
            0:{Math.floor((progress / 100) * 12).toString().padStart(2, "0")}
          </span>
          <div
            className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setProgress((clickX / rect.width) * 100);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-xl"></div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-white/50 w-8 text-right">
            0:12
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              id="play_pause_button"
              className="p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-white/90 transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={restartVideo}
              id="refresh_button"
              className="p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-white/90 transition-colors cursor-pointer"
              title="Restart Loop"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-white/50 border-l border-white/10 pl-3 font-sans truncate max-w-[180px] sm:max-w-none">
              Source: <span className="text-white/80 font-semibold">{factTitle}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
              1080p HD
            </span>
            <button
              className="p-1.5 bg-white/5 hover:bg-white/15 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Fullscreen (Simulation)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
