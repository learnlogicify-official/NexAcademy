"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

interface AIAvatar3DProps {
  expression: "neutral" | "happy" | "thinking" | "excited"
  isTyping: boolean
}

export default function AIAvatar3D({ expression, isTyping }: AIAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f7ff)

    // Set up camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    camera.position.z = 5

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(200, 200)
    containerRef.current.appendChild(renderer.domElement)

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(0, 1, 1)
    scene.add(directionalLight)

    // Create robot head (simplified)
    const headGeometry = new THREE.SphereGeometry(2, 32, 32)
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      shininess: 100,
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    scene.add(head)

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.7, 0.3, 1.8)
    scene.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.7, 0.3, 1.8)
    scene.add(rightEye)

    // Add pupils
    const pupilGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 })

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
    leftPupil.position.set(-0.7, 0.3, 2.1)
    scene.add(leftPupil)

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial)
    rightPupil.position.set(0.7, 0.3, 2.1)
    scene.add(rightPupil)

    // Add mouth
    const mouthGeometry = new THREE.BoxGeometry(1, 0.2, 0.1)
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial)
    mouth.position.set(0, -0.7, 2)
    scene.add(mouth)

    // Add antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 16)
    const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xc4b5fd })
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial)
    antenna.position.set(0, 2, 0)
    scene.add(antenna)

    const antennaTipGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const antennaTipMaterial = new THREE.MeshPhongMaterial({
      color: 0xddd6fe,
      emissive: 0xddd6fe,
      emissiveIntensity: 0.5,
    })
    const antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial)
    antennaTip.position.set(0, 2.5, 0)
    scene.add(antennaTip)

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.rotateSpeed = 0.5
    controls.autoRotate = true
    controls.autoRotateSpeed = 1

    // Animation loop
    let animationFrame: number

    const animate = () => {
      animationFrame = requestAnimationFrame(animate)

      // Update based on expression
      switch (expression) {
        case "happy":
          mouth.scale.set(1, 1.5, 1)
          mouth.position.y = -0.6
          break
        case "thinking":
          mouth.scale.set(0.7, 1, 1)
          leftPupil.position.y = 0.4
          rightPupil.position.y = 0.4
          break
        case "excited":
          mouth.scale.set(1, 1.8, 1)
          antennaTip.scale.y = 1 + Math.sin(Date.now() * 0.01) * 0.2
          break
        default:
          mouth.scale.set(1, 1, 1)
          mouth.position.y = -0.7
          leftPupil.position.y = 0.3
          rightPupil.position.y = 0.3
      }

      // Typing animation
      if (isTyping) {
        antennaTip.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5
        head.rotation.y = Math.sin(Date.now() * 0.002) * 0.1
      } else {
        antennaTip.material.emissiveIntensity = 0.5
      }

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [expression, isTyping])

  return (
    <motion.div
      ref={containerRef}
      className="w-48 h-48 mx-auto rounded-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}
