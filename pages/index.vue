<script setup lang='ts' type="module">
import * as THREE from "three";
import { OrbitControls } from 'three-orbitcontrols-ts';
import gsap from "gsap";

definePageMeta({
    title: 'My home page'
})

const canvasRef = ref(null);
const buttRef = ref(null);
const stuffRef = ref(null);
const nameRef = ref(null);

onMounted(() => {

    const world = {
        plane: {
            width: 400,
            hight: 400,
            widthSegment: 50,
            hightSegment: 50,
        },
    };

    const raycaster = new THREE.Raycaster();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        innerWidth / innerHeight,
        0.1,
        1000
    );

    camera.position.z = 50;
    // camera.position.z = 200;


    const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value
    });

    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);

    const controls = new OrbitControls(camera, renderer.domElement);

    //light
    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0.5, 1);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(0, 1, -1);
    scene.add(backLight);

    // The star sky

    const starGeometry = new THREE.BufferGeometry();
    const startMatterial = new THREE.PointsMaterial({
        color: 0xffffff,
    });
    const random = (min:number, max:number) => Math.floor(Math.random() * (max - min)) + min;
    const rand = (items:number[]) => {
        return items[~~(items.length * Math.random())];
    }
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        // const z = (Math.random() - 0.5) * 2000;
        // const x = rand([random(-1000, -100), random(100, 1000)]);
        // const y = rand([random(-1000, -100), random(100, 1000)]);
        const z = rand([random(-1000, -50), random(50, 1000)]);
        starVertices.push(x, y, z);
    }

    const starVerticesF32 = new Float32Array(starVertices);

    starGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starVerticesF32, 3)
    );

    const stars = new THREE.Points(starGeometry, startMatterial);
    scene.add(stars);

    //plane

    const planeGeometry = new THREE.PlaneGeometry(
        world.plane.width,
        world.plane.hight,
        world.plane.widthSegment,
        world.plane.hightSegment
    );
    const planeMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        flatShading: true,
        vertexColors: true,
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    const original_pos = {
        posArr: <number[]>[],
        randVal: <number[]>[],
    };

    // Saving original vertex position and some random values assosiated to the vertices for animating them later down in the main loop

    original_pos.posArr = [
        ...(plane.geometry.attributes.position.array as number[]),
    ];
    for (let index = 0; index < plane.geometry.attributes.position.count; index++) {
        original_pos.randVal.push(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random()
        );
    }

    // color the plane
    const colors = [];
    for (let index = 0; index < plane.geometry.attributes.position.count; index++) {
        colors.push(0.43, 0.03, 0.06);
    }

    plane.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(colors), 3)
    );

    // randomise vertises
    const { array } = plane.geometry.attributes.position;

    for (let i = 0; i < array.length; i += 3) {
        (array as number[])[i] += Math.random() - 0.5; // the x position of the vertex
        (array as number[])[i + 1] += (Math.random() - 0.5) * 2; // the y position of the vertex
        (array as number[])[i + 2] += (Math.random() - 0.5) * 8; // the z position of the vertex
    }

    // hover ray pointer
    const pointer = new THREE.Vector2();

    document.addEventListener("mousemove", (event) => {
        pointer.x = (event.clientX / innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / innerHeight) * 2 + 1;
    });

    let frame = 0;
    const animate = () => {
        requestAnimationFrame(animate);
        frame += 0.01;

        // animate vertices
        const { array } = plane.geometry.attributes.position;

        for (let i = 0; i < array.length; i += 3) {
            (array as number[])[i] =
                original_pos.posArr[i] + Math.cos(frame + original_pos.randVal[i]); // the x position of the vertex
            (array as number[])[i + 1] =
                original_pos.posArr[i + 1] +
                Math.sin(frame + original_pos.randVal[i + 1]) * 2; // the y position of the vertex
            plane.geometry.attributes.position.needsUpdate = true; // update vertex
        }

        // hover ray stuff
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            if (intersects[0].face) {
                const { color } = (intersects[0].object as THREE.Mesh).geometry
                    .attributes;

                const initialColor = {
                    r: 0.4,
                    g: 0.03,
                    b: 0.06,
                };

                const hoverColor = {
                    r: 0.721,
                    g: 0.007,
                    b: 0.086,
                };

                // vertex 1
                color.setX(intersects[0].face.a, hoverColor.r);
                color.setY(intersects[0].face.a, hoverColor.g);
                color.setZ(intersects[0].face.a, hoverColor.b);

                // vertex 2
                color.setX(intersects[0].face.b, hoverColor.r);
                color.setY(intersects[0].face.b, hoverColor.g);
                color.setZ(intersects[0].face.b, hoverColor.b);

                // vertex 3
                color.setX(intersects[0].face.c, hoverColor.r);
                color.setY(intersects[0].face.c, hoverColor.g);
                color.setZ(intersects[0].face.c, hoverColor.b);

                //update color
                color.needsUpdate = true;

                gsap.to(hoverColor, {
                    r: initialColor.r,
                    g: initialColor.g,
                    b: initialColor.b,
                    onUpdate: () => {
                        if (intersects[0].face) {
                            // vertex 1
                            color.setX(intersects[0].face.a, hoverColor.r);
                            color.setY(intersects[0].face.a, hoverColor.g);
                            color.setZ(intersects[0].face.a, hoverColor.b);

                            // vertex 2
                            color.setX(intersects[0].face.b, hoverColor.r);
                            color.setY(intersects[0].face.b, hoverColor.g);
                            color.setZ(intersects[0].face.b, hoverColor.b);

                            // vertex 3
                            color.setX(intersects[0].face.c, hoverColor.r);
                            color.setY(intersects[0].face.c, hoverColor.g);
                            color.setZ(intersects[0].face.c, hoverColor.b);
                            //update color
                            color.needsUpdate = true;
                        }
                    },
                });
            }
        }

        // animate sky
        stars.rotation.z += 0.0005;

        renderer.render(scene, camera);
    };

    animate();

    // resize canvas on browser resize

    document.addEventListener("resize", (e) => {
        renderer.setSize(innerWidth, innerHeight);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
    });

    // animate in html stuff
    gsap.to(nameRef.value, {
        opacity: 1,
        duration: 2.4,
        y: 0,
        ease: "elastic",
    });

    gsap.to(stuffRef.value, {
        opacity: 1,
        duration: 2.4,
        delay: 0.3,
        y: 0,
        ease: "elastic",
    });

    gsap.to(buttRef.value, {
        opacity: 1,
        duration: 2.4,
        delay: 0.6,
        y: 0,
        ease: "elastic",
    });

    buttRef.value.addEventListener("click", (e) => {
        e.preventDefault();

        gsap.to("#content", {
            opacity: 0,
            duration: 0.3,
        });

        gsap.to(camera.position, {
            z: 25,
            duration: 2,
            ease: "power3.inOut",
        });

        gsap.to(camera.rotation, {
            x: 1.57,
            duration: 2,
            ease: "power3.inOut",
        });

        gsap.to(camera.position, {
            y: 1000,
            duration: 1.5,
            ease: "power3.in",
            delay: 2,
            onComplete: () => {
                window.location = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley" as (string | Location) & Location;
            }
        });
    });
});
</script>

<template>
    <NuxtLayout>
        <canvas ref="canvasRef"></canvas>
        <div id="content"
            class="max-w-3xl w-full px-6 absolute text-white text-center antialiased top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <h1 id="name" ref="nameRef" class="opacity-0 translate-y-20 text-2xl mb-6">Hello stranger</h1>
            <p id="stuff" ref="stuffRef"
                class="opacity-0 translate-y-20 text-5xl tracking-wide italic font-semibold uppercase mb-8">
                Dont click the button 
            </p>
            <button id="butt" ref="buttRef"
                class="opacity-0 translate-y-20 border text-xl font-semibold tracking-wide uppercase text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black">
                button
            </button>
        </div>
    </NuxtLayout>

</template>

<style scoped>
</style>