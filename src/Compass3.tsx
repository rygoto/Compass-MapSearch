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
    AxesViewer,
    WebXRState,
    WebXRDomOverlay,
    Texture,
    StandardMaterial,
    Space,
    Axis,
    PointerEventTypes,
    SceneLoader,
    Color3,
    DynamicTexture,
    Vector4,
    PBRMetallicRoughnessMaterial,
    CubeTexture,
    Color4,
    Quaternion,
    PBRMaterial,
    Matrix,
    Animation,
    QuadraticEase,
    EasingFunction,
    TransformNode
} from '@babylonjs/core';
import '@babylonjs/loaders';
//import { AdvancedDynamicTexture, Control } from '@babylonjs/gui/2D';
//import * as GUI from 'babylonjs-gui';
import * as GUI from '@babylonjs/gui';
import { noodleshopdata, parkdata, cafeData, conveniData } from './shopData';

const CreateCompass = (scene: Scene) => {
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

    SceneLoader.ImportMeshAsync("", "/", "Compass5.glb", scene).then((result) => {
        const compass = result.meshes[0];
        compass.position = new Vector3(0, 0.18, 0);
        let scaleValue = 0.8;
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

    const cylinderForRotation = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 0.05, diameterBottom: 0.05, height: 0.7 }, scene);
    cylinderForRotation.position = new Vector3(0, -0.58, 3.9);
    cylinderForRotation.rotation = new Vector3(Math.PI / 10, Math.PI, Math.PI / 2);
    cylinderForRotation.visibility = 0;
    cylinderForRotation.parent = compassParent;

    SceneLoader.ImportMeshAsync("", "/", "Compass-Cover3.glb", scene).then((result) => {
        const cover = result.meshes[0];
        cover.position = new Vector3(0, 0, 1);
        let scaleValue = 0.8;
        cover.scaling = new Vector3(scaleValue, scaleValue, scaleValue);

        cover.rotation = new Vector3(0, Math.PI, Math.PI / 2);
        cover.parent = cylinderForRotation;

        const metalicMaterial = new PBRMetallicRoughnessMaterial("metal", scene);
        metalicMaterial.baseColor = new Color3(0.9, 0.9, 0.5);
        metalicMaterial.metallic = 0.5;
        metalicMaterial.roughness = 0.5;
        cover.material = metalicMaterial;
    });

    const cylinderForClick = MeshBuilder.CreateCylinder("cylinder", { diameterTop: 2, diameterBottom: 2, height: 0.1 }, scene);
    cylinderForClick.parent = cylinderForRotation;
    cylinderForClick.position = new Vector3(0.07, 0, 1);
    cylinderForClick.rotation = new Vector3(-Math.PI / 10, 0, Math.PI / 2);
    cylinderForClick.visibility = 0;

    let isReversed = false;
    cylinderForClick.actionManager = new ActionManager(scene);
    cylinderForClick.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        const frameRate = 24;
        const animationDuration = 0.75;

        const rotationAnimation = new Animation(
            "rotationAnimation",
            "rotation.x",
            frameRate,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const startValue = isReversed ? -Math.PI * 8 / 7 : 0;
        const endValue = isReversed ? Math.PI / 10 : -Math.PI * 8 / 7;

        const keyFrames = [];
        keyFrames.push({ frame: 0, value: startValue });
        keyFrames.push({ frame: frameRate * animationDuration, value: endValue });

        rotationAnimation.setKeys(keyFrames);

        const easingFunction = new QuadraticEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        rotationAnimation.setEasingFunction(easingFunction);

        scene.beginDirectAnimation(cylinderForRotation, [rotationAnimation], 0, frameRate * animationDuration, false);
        isReversed = !isReversed;
    }));

    SceneLoader.ImportMeshAsync("", "/", "Compass-Deco.glb", scene).then((result) => {
        const deco = result.meshes[0];
        deco.position = new Vector3(0, -0.85, 2.95);
        let scaleValue = 0.8;
        deco.scaling = new Vector3(scaleValue, scaleValue, scaleValue);
        deco.rotation = new Vector3(-Math.PI / 10, 0, 0);

        const metalicMaterial = new PBRMetallicRoughnessMaterial("metal", scene);
        metalicMaterial.baseColor = new Color3(0.9, 0.9, 0.5);
        metalicMaterial.metallic = 0.5;
        metalicMaterial.roughness = 0.5;
        deco.material = metalicMaterial;
        deco.parent = compassParent;
    });

    const compassScale = 0.4;
    compassParent.scaling = new Vector3(compassScale, compassScale, compassScale);
    compassParent.position = new Vector3(0, 0.6, 0);

    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.13 }, scene);
    sphere.position = new Vector3(0, 0.08, 0.7);
    sphere.visibility = 0;

    sphere.actionManager = new ActionManager(scene);
    sphere.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, () => {
        const frameRate = 24;
        const animationDuration = 0.75;

        const rotationAnimation = new Animation(
            "rotationAnimation",
            "rotation.x",
            frameRate,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const startValue = isReversed ? -Math.PI * 8 / 7 : 0;
        const endValue = isReversed ? Math.PI / 10 : -Math.PI * 8 / 7;

        const keyFrames = [];
        keyFrames.push({ frame: 0, value: startValue });
        keyFrames.push({ frame: frameRate * animationDuration, value: endValue });

        rotationAnimation.setKeys(keyFrames);

        const easingFunction = new QuadraticEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        rotationAnimation.setEasingFunction(easingFunction);

        scene.beginDirectAnimation(cylinderForRotation, [rotationAnimation], 0, frameRate * animationDuration, false);
        isReversed = !isReversed;
    }));

    return compassParent;
};

const MapCompass: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [sliderValue, setSliderValue] = useState(1);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const engine = new Engine(canvas, true);
            const scene = new Scene(engine);
            const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 0, 5), scene);
            camera.attachControl(canvas, true);
            const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

            const compass = CreateCompass(scene);

            //Create XR experience
            scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                },
            });/*.then(xrExperience => {
                const featuresManager = xrExperience.baseExperience.featuresManager;
                featuresManager.enableFeature(WebXRDomOverlay, "latest",
                    { element: ".dom-overlay-container" }, undefined, false);

                xrExperience.baseExperience.onStateChangedObservable.add((webXRState) => {
                    const overlayElement = document.querySelector('.dom-overlay-container');
                    if (overlayElement) {
                        switch (webXRState) {
                            case WebXRState.ENTERING_XR:
                            case WebXRState.IN_XR:
                                overlayElement.style.display = 'block'; // オーバーレイを表示
                                //overlayElement.textContent = 'うんこしてますかー'; // 例として文字を表示
                                break;
                            default:
                                overlayElement.style.display = 'none'; // 非表示にするnoneだった
                                break;
                        }
                    }
                });
            });*/
            //End of Create XR experience

            engine.runRenderLoop(() => {
                scene.render();
            });

            return () => {
                engine.dispose();
            };
        }
    }, []);

    return (
        <>
            <div className="dom-overlay-container" style={{ display: 'block' }}>
                <label>範囲 : {(sliderValue * 100).toFixed(2)}m</label>
                <input
                    type="range"
                    min="0.3"
                    max="5"
                    step="0.05"
                    value={sliderValue}
                    className="dom-overlay-slider"
                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                />
            </div>
            <canvas ref={canvasRef} style={{ width: '100vh', height: '100vh' }} />
        </>
    );
}

export default MapCompass;