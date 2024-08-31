import React, { useEffect, useRef, useState } from 'react';
import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    MeshBuilder,
    Mesh,
    ActionManager,
    ExecuteCodeAction,
    TransformNode,
    Texture,
    StandardMaterial,
    PBRMetallicRoughnessMaterial,
    SceneLoader,
    Color3,
    Animation,
    QuadraticEase,
    EasingFunction,
    PBRMaterial,
} from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';
import { noodleshopdata, parkdata, cafeData, conveniData } from './shopData';

interface ShopData {
    shopName: string;
    shopDistance: string;
    angle: number;
    radius: number;
}

function Compass() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [sliderValue, setSliderValue] = useState<number>(1.5);
    const [texture, setTexture] = useState<Texture | null>(null);
    const [iconsonMap, setIconsonMap] = useState<Mesh[]>([]);
    const [unvisiblecylinder, setUnvisibleCylinder] = useState<Mesh | null>(null);
    const [fontData, setFontData] = useState<any | null>(null);

    useEffect(() => {
        const loadFontData = async () => {
            const fetchedFontData = await fetch("https://assets.babylonjs.com/fonts/Droid Sans_Regular.json").then(res => res.json());
            setFontData(fetchedFontData);
        };
        loadFontData();
    }, []);

    const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliderValue(parseFloat(event.target.value));
    };

    useEffect(() => {
        if (texture) {
            const uvScale = sliderValue / 1.8;
            const scaleFactorU = 0.7 * uvScale;
            const scaleFactorV = 1.2 * uvScale;

            const uOffset = 0.5 * (1 - scaleFactorU);
            const vOffset = 0.5 * (1 - scaleFactorV);
            texture.uScale = scaleFactorU;
            texture.vScale = scaleFactorV;

            texture.uOffset = uOffset;
            texture.vOffset = vOffset;
        }
    }, [sliderValue, texture]);

    useEffect(() => {
        if (unvisiblecylinder) {
            const scaleValue = 1 / sliderValue;
            unvisiblecylinder.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
        }
    }, [sliderValue, unvisiblecylinder]);

    function ClickIcon(
        clickedIcon: Mesh,
        shopdata: ShopData[],
        compass: Mesh,
        compass2: Mesh,
        sliderValue: number,
        scene: Scene
    ) {
        const newIcons: Mesh[] = [];
        const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const manager = new GUI.GUI3DManager(scene);

        shopdata.forEach((data, index) => {
            const angle = data.angle;
            const radius = data.radius;
            const iconx = radius * Math.cos(angle);
            const iconz = radius * Math.sin(angle);
            const icony = 0.035;

            const icononMap = clickedIcon.clone("icononMap" + index);
            const icononWorld = clickedIcon.clone("icononWorld" + index);
            if (icononMap) {
                icononMap.position = new Vector3(iconx, icony, iconz);
                icononMap.rotation = compass.rotation;
                const scaleValue = 0.045;
                icononMap.scaling = new Vector3(scaleValue, 0.038, scaleValue);
                icononMap.parent = compass;
                icononMap.rotate(Vector3.Up(), Math.PI / 2);

                const distancevalue = 10.0;
                const heightvalue = 2.0;
                const icononWorldx = iconx * distancevalue;
                const icononWorldz = iconz * distancevalue;
                icononWorld.position = new Vector3(icononWorldx, heightvalue, icononWorldz);
                icononWorld.parent = compass;
                icononWorld.rotation = compass.rotation;

                const label = new GUI.TextBlock();
                label.text = data.shopName;
                label.color = "white";
                label.fontSize = 24;
                label.outlineWidth = 2;
                label.outlineColor = "black";

                guiTexture.addControl(label);
                label.linkWithMesh(icononWorld);
                label.linkOffsetY = 30.0;

                const label2 = new GUI.TextBlock();
                label2.text = data.shopDistance;
                label2.color = "white";
                guiTexture.addControl(label2);
                label2.linkWithMesh(icononWorld);
                label2.linkOffsetY = 55.0;
            }
            newIcons.push(icononMap);
        });
        setIconsonMap(newIcons);
    }

    useEffect(() => {
        if (canvasRef.current) {
            const engine = new Engine(canvasRef.current, true);
            const scene = new Scene(engine);
            const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 5), scene);
            camera.attachControl(canvasRef.current, true);
            const light = new HemisphericLight("light", new Vector3(2, 5, 3), scene);
            light.intensity = 2;
            const light2 = new HemisphericLight("light", new Vector3(0.5, 0, 4), scene);
            light2.intensity = 0.9;
            const light3 = new HemisphericLight("light", new Vector3(-3, 0, 0), scene);
            light3.intensity = 0.9;

            // Create Map-Compass
            const compassParent = new TransformNode("compassParent", scene);
            const cylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.07 }, scene);
            const textureInstance = new Texture('map2.png');
            const material = new StandardMaterial("material", scene);
            material.diffuseTexture = textureInstance;
            material.specularColor = new Color3(0, 0, 0);
            material.specularPower = 0;
            material.roughness = 1;
            cylinder.material = material;
            cylinder.position.z = 3;
            cylinder.position.y = -1;
            cylinder.rotation.x = -Math.PI / 10;
            cylinder.parent = compassParent;
            setTexture(textureInstance);
            SceneLoader.ImportMeshAsync("", "/", "Compass5.glb", scene).then((result) => {
                const compass = result.meshes[0];
                compass.position = new Vector3(0, 0.18, 0);
                const scaleValue = 0.8;
                compass.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
                compass.rotation.x = -Math.PI / 10;
                compass.parent = cylinder;

                const metalicMaterial = new PBRMetallicRoughnessMaterial("metal", scene);
                metalicMaterial.baseColor = new Color3(0.9, 0.9, 0.5);
                metalicMaterial.metallic = 0.5;
                metalicMaterial.roughness = 0.5;
            });
            const unvisibleCylinder = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.07 }, scene);
            unvisibleCylinder.visibility = 0;
            unvisibleCylinder.parent = cylinder;
            setUnvisibleCylinder(unvisibleCylinder);

            const glassCircle = MeshBuilder.CreateCylinder("circle", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.01 }, scene);
            glassCircle.position.z = 3;
            glassCircle.position.y = -0.9;
            glassCircle.rotation.x = -Math.PI / 10;
            const glass = new PBRMaterial("glass", scene);
            glass.indexOfRefraction = 0.52;
            glass.alpha = 0.3;
            glass.directIntensity = 0.0;
            glass.environmentIntensity = 0.5;
            glass.cameraExposure = 0.66;
            glass.cameraContrast = 1.66;
            glass.microSurface = 1.0;
            glass.reflectivityColor = new Color3(0.2, 0.2, 0.2);
            glass.albedoColor = new Color3(0.85, 0.85, 0.85);
            glassCircle.material = glass;
            glassCircle.parent = compassParent;

            SceneLoader.ImportMeshAsync("", "/", "yajirushi2.glb", scene).then((result) => {
                const yajirushioncompass = result.meshes[0];
                yajirushioncompass.position = new Vector3(0, 0.17, 0.6);
                yajirushioncompass.scaling = new Vector3(0.16, 0.1, 0.1);
                yajirushioncompass.rotation = new Vector3(0, Math.PI, 0);
                yajirushioncompass.parent = cylinder;
            });

            const cylinderForRotation = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 1.85, diameterBottom: 1.85, height: 0.07 }, scene);
            const redMaterial = new StandardMaterial("redMaterial", scene);
            redMaterial.diffuseColor = new Color3(1, 0, 0);
            cylinderForRotation.material = redMaterial;
            cylinderForRotation.parent = cylinder;

            const easingFunction = new QuadraticEase();
            easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

            const rotateAnimation = new Animation("rotateAnimation", "rotation.y", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
            const rotateKeys = [
                { frame: 0, value: 0 },
                { frame: 30, value: Math.PI / 2 }
            ];
            rotateAnimation.setKeys(rotateKeys);
            rotateAnimation.setEasingFunction(easingFunction);
            cylinderForRotation.animations = [rotateAnimation];
            scene.beginAnimation(cylinderForRotation, 0, 30, true);

            // Event handling
            scene.onPointerDown = function () {
                if (unvisibleCylinder) {
                    ClickIcon(unvisibleCylinder, noodleshopdata, cylinderForRotation, cylinderForRotation, sliderValue, scene);
                }
            };

            engine.runRenderLoop(() => {
                scene.render();
            });

            return () => {
                engine.dispose();
            };
        }
    }, [sliderValue]);

    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            <input type="range" min="1.0" max="2.0" step="0.01" value={sliderValue} onChange={handleSliderChange} />
        </div>
    );
}

export default Compass;








