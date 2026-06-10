'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

const CITIES = [
  { name: 'Dakar', lat: 14.6937, lng: -17.4441 },
  { name: 'Abidjan', lat: 5.3484, lng: -4.0267 },
  { name: 'Bamako', lat: 12.6392, lng: -8.0029 },
  { name: 'Yaoundé', lat: 3.8480, lng: 11.5021 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Montréal', lat: 45.5017, lng: -73.5673 },
]

function latLngToXYZ(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function StarField() {
  const count = 1500
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  return (
    <Points positions={positions} limit={count}>
      <PointMaterial
        transparent
        color="#E8A020"
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  )
}

function CityDots({ isDark }: { isDark: boolean }) {
  const color = isDark ? '#E8A020' : '#E85D04'
  return (
    <>
      {CITIES.map((city) => {
        const pos = latLngToXYZ(city.lat, city.lng, 1.02)
        return (
          <mesh key={city.name} position={[pos.x, pos.y, pos.z]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        )
      })}
    </>
  )
}

function Arc({ start, end, isDark, delay = 0 }: { start: THREE.Vector3; end: THREE.Vector3; isDark: boolean; delay?: number }) {
  const ref = useRef<THREE.Line>(null)
  const progressRef = useRef(delay)

  const points = useMemo(() => {
    const mid = start.clone().add(end).multiplyScalar(0.5)
    const dist = start.distanceTo(end)
    mid.normalize().multiplyScalar(1.0 + dist * 0.3)
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    return curve.getPoints(50)
  }, [start, end])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(points.length * 3)
    points.forEach((p, i) => { positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z })
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [points])

  useFrame((_, delta) => {
    progressRef.current = (progressRef.current + delta * 0.3) % 4
    if (!ref.current) return
    const mat = ref.current.material as THREE.LineBasicMaterial
    const p = progressRef.current
    mat.opacity = p < 2 ? Math.sin((p / 2) * Math.PI) * 0.8 : 0
  })

  return (
    <primitive
      ref={ref}
      object={new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: isDark ? '#00D4FF' : '#1A5CB5',
          transparent: true,
          opacity: 0,
          linewidth: 1,
        })
      )}
    />
  )
}

function GlobeCore({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003
    }
  })

  const arcs = useMemo(() => {
    const pairs: Array<[number, number, number]> = [
      [0, 1, 0], [0, 2, 0.5], [0, 4, 1], [1, 3, 1.5], [2, 4, 2], [3, 5, 2.5],
    ]
    return pairs.map(([a, b, delay]) => ({
      start: latLngToXYZ(CITIES[a].lat, CITIES[a].lng, 1.01),
      end: latLngToXYZ(CITIES[b].lat, CITIES[b].lng, 1.01),
      delay,
    }))
  }, [])

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      {/* Globe sphere */}
      <Sphere args={[1, 64, 64]}>
        <meshPhongMaterial
          color={isDark ? '#0D1526' : '#E8F4FF'}
          emissive={isDark ? '#0D1526' : '#F0F8FF'}
          specular={isDark ? '#1E3A5F' : '#AABBCC'}
          shininess={20}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.001, 24, 24]}>
        <meshBasicMaterial
          color={isDark ? '#1E2D45' : '#DDEBF8'}
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.08, 32, 32]}>
        <meshBasicMaterial
          color={isDark ? '#00D4FF' : '#1A5CB5'}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* City dots */}
      <CityDots isDark={isDark} />

      {/* Arcs */}
      {arcs.map((arc, i) => (
        <Arc key={i} start={arc.start} end={arc.end} isDark={isDark} delay={arc.delay} />
      ))}
    </group>
  )
}

function Scene({ isDark }: { isDark: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color={isDark ? '#E8A020' : '#FFD57A'} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color={isDark ? '#00D4FF' : '#AADDFF'} />
      {isDark && <StarField />}
      <GlobeCore isDark={isDark} />
    </>
  )
}

export default function Globe({ isDark }: { isDark: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Scene isDark={isDark} />
    </Canvas>
  )
}
