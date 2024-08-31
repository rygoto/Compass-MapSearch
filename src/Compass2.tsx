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
import * as GUI from '@babylonjs/gui';
import { noodleshopdata, parkdata, cafeData, conveniData } from './shopData';

interface ShopData {
    angle: number;
    radius: number;
    shopName: string;
    shopDistance: string;
}

function Compass() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [sliderValue, setSliderValue] = useState<number>(1.5);
    const [texture, setTexture] = useState<Texture | null>(null);
    const [noodleIcons, setNoodleIcons] = useState<Mesh[]>([]);
    const [parkIcons, setParkIcons] = useState<Mesh[]>([]);
    const [cafeIcons, setCafeIcons] = useState<Mesh[]>([]);
    const [fontData, setFontData] = useState<any>(null);
    const [iconsonMap, setIconsonMap] = useState<Mesh[]>([]);
    const [unvisiblecylinder, setUnvisibleCylinder] = useState<Mesh | null>(null);

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

    function ClickIcon(clickedIcon: Mesh, shopdata: ShopData[], compass: Mesh, compass2: Mesh, sliderValue: number, scene: Scene) {
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
                label.linkOffsetX = 10.0;
                //label.linkOffsetZ = 0.0;

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

            SceneLoader.ImportMeshAsync("", "/", "Compass5.glb", scene)
                .then((result) => {
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
            setUnvisibleCylinder(unvisibleCylinder);

            // End of Create Map Compass

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

            SceneLoader.ImportMeshAsync("", "/", "yajirushi2.glb", scene)
                .then((result) => {
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

            SceneLoader.ImportMeshAsync("", "/", "Compass-Cover3.glb", scene)
                .then((result) => {
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
            cylinderForClick.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,
                function () {
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
                    keyFrames.push({
                        frame: 0,
                        value: startValue
                    });
                    keyFrames.push({
                        frame: frameRate * animationDuration,
                        value: endValue
                    });

                    rotationAnimation.setKeys(keyFrames);

                    const easingFunction = new QuadraticEase();
                    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
                    rotationAnimation.setEasingFunction(easingFunction);

                    scene.beginDirectAnimation(cylinderForRotation, [rotationAnimation], 0, frameRate * animationDuration, false);
                    isReversed = !isReversed
                }
            ));

            let deco: Mesh;
            SceneLoader.ImportMeshAsync("", "/", "Compass-Deco.glb", scene)
                .then((result) => {
                    deco = result.meshes[0];
                    deco.position = new Vector3(0, -0.85, 2.95);
                    let scaleValue = 0.8;
                    deco.scaling = new Vector3(scaleValue, scaleValue, scaleValue);

                    deco.rotation = new Vector3(-Math.PI / 10, 0, 0);

                    const metalicMaterial = new PBRMetallicRoughnessMaterial("metal", scene);
                    metalicMaterial.baseColor = new Color3(0.9, 0.9, 0.5);
                    metalicMaterial.metallic = 0.5;
                    metalicMaterial.roughness = 0.5;
                    deco.parent = compassParent;
                });
            const compassScale = 0.4;
            compassParent.scaling = new Vector3(compassScale, compassScale, compassScale);
            compassParent.position = new Vector3(0, 0.6, 0);
            const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.13 }, scene);
            sphere.position = new Vector3(0, 0.08, 0.7);
            sphere.visibility = 0;
            sphere.actionManager = new ActionManager(scene);
            sphere.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,

                function () {
                    // アニメーションの作成
                    const frameRate = 24;
                    const animationDuration = 0.75; // 秒単位

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
                    keyFrames.push({
                        frame: 0,
                        value: startValue
                    });
                    keyFrames.push({
                        frame: frameRate * animationDuration,
                        value: endValue
                    });

                    rotationAnimation.setKeys(keyFrames);

                    // イージング関数を追加（オプション）
                    const easingFunction = new QuadraticEase();
                    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
                    rotationAnimation.setEasingFunction(easingFunction);

                    // アニメーションの開始
                    scene.beginDirectAnimation(cylinderForRotation, [rotationAnimation], 0, frameRate * animationDuration, false);
                    isReversed = !isReversed
                }
            ));


            //End of Create Compass


            //Create Map Icons
            let noodleIcon = null;
            let parkIcon = null;
            let cafeIcon = null;
            let conveniIcon = null;
            const for4verscale = 3 / 4;
            SceneLoader.ImportMeshAsync("", "/", "noodle.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    noodleIcon = result.meshes[0];
                    noodleIcon.position = new Vector3(0.2, -0.2, 0.8);
                    noodleIcon.scaling = new Vector3(0.08, 0.08, 0.08);
                    noodleIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            const box1 = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box1.position = new Vector3(0.2, 0, 0.8); // 位置設定を修正
            box1.scaling = new Vector3(0.5, 0.5, 0.5);
            box1.visibility = 0;
            box1.actionManager = new ActionManager(scene);
            box1.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
                ClickIcon(noodleIcon, noodleshopdata, cylinder, unvisibleCylinder, sliderValue, scene);
            }));
            const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
            const manager = new GUI.GUI3DManager(scene);
            const label = new GUI.TextBlock();
            label.text = "noodle";
            label.color = "white";
            guiTexture.addControl(label);
            label.linkWithMesh(box1);
            label.linkOffsetY = 150.0;
            label.fontSize = 42;

            SceneLoader.ImportMeshAsync("", "/", "park.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    parkIcon = result.meshes[0];
                    parkIcon.position = new Vector3(-0.22, -0.2, 0.8);
                    parkIcon.scaling = new Vector3(0.06, 0.06, 0.06);
                    parkIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            const box2 = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box2.position = new Vector3(-0.22, 0, 0.8); // 位置設定を修正
            box2.scaling = new Vector3(0.5, 0.5, 0.5);
            box2.visibility = 0;
            box2.actionManager = new ActionManager(scene);
            box2.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
                ClickIcon(parkIcon, parkdata, cylinder);
            }));
            const label2 = new GUI.TextBlock();
            label2.text = "park";
            label2.color = "white";
            guiTexture.addControl(label2);
            label2.linkWithMesh(box2);
            label2.linkOffsetY = 150.0;
            label2.fontSize = 42;

            SceneLoader.ImportMeshAsync("", "/", "cafe.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    cafeIcon = result.meshes[0];
                    cafeIcon.position = new Vector3(-0.4, -0.2, 0.8);
                    cafeIcon.scaling = new Vector3(0.06, 0.06, 0.06);
                    cafeIcon.rotation = new Vector3(0, -Math.PI / 2, 0);
                });

            const box3 = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box3.position = new Vector3(-0.4, 0, 0.8); // 位置設定を修正
            box3.scaling = new Vector3(0.5, 0.5, 0.5);
            box3.visibility = 0;
            box3.actionManager = new ActionManager(scene);
            box3.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
                ClickIcon(cafeIcon, cafeData, cylinder);
            }));
            const label3 = new GUI.TextBlock();
            label3.text = "cafe";
            label3.color = "white";
            guiTexture.addControl(label3);
            label3.linkWithMesh(box3);
            label3.linkOffsetY = 150.0;
            label3.fontSize = 42;

            SceneLoader.ImportMeshAsync("", "/", "conveni.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    conveniIcon = result.meshes[0];
                    conveniIcon.position = new Vector3(0.4, -0.2, 0.8);
                    conveniIcon.scaling = new Vector3(0.045, 0.045, -0.045);
                    conveniIcon.rotation = new Vector3(0, Math.PI / 2, 0);
                });
            const box4 = MeshBuilder.CreateBox("box", { width: 0.3, height: 0.3, depth: 0.3 }, scene);
            box4.position = new Vector3(0.37, 0, 0.8); // 位置設定を修正
            box4.visibility = 0;
            box4.scaling = new Vector3(0.5, 0.5, 0.5);
            box4.actionManager = new ActionManager(scene);
            box4.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
                ClickIcon(conveniIcon, conveniData, cylinder);
            }));
            const label4 = new GUI.TextBlock();
            label4.text = "shop";
            label4.color = "white";
            guiTexture.addControl(label4);
            label4.linkWithMesh(box4);
            label4.linkOffsetY = 150.0;
            label4.fontSize = 42;
            //End of Create Map Icons

            //Create DekaYajirushi
            SceneLoader.ImportMeshAsync("", "/", "yajirushi2.glb", scene)
                .then((result) => {
                    // 読み込んだメッシュの最初の要素に対して位置とスケールを設定
                    const yajirushi = result.meshes[0];
                    yajirushi.position = new Vector3(0, 1, 4);
                    yajirushi.scaling = new Vector3(0.2, 0.2, 0.2);
                    yajirushi.rotation = new Vector3(Math.PI / 4 - Math.PI / 8, Math.PI, 0);
                    yajirushi.parent = cylinder;
                });
            //End of Create Yajirushi

            //Create XR experience
            scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                },
            }).then(xrExperience => {
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
            });
            //End of Create XR experience

            // const axesViewer = new AxesViewer(scene);

            // Create Touch Function
            let isTouchActive = false;
            let currentPointerPosition = null;
            let lastPointerPosition = null;

            scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERDOWN:
                        if (pointerInfo.pickInfo.pickedPoint) {
                            isTouchActive = true;
                            lastPointerPosition = pointerInfo.pickInfo.pickedPoint.clone();
                            currentPointerPosition = pointerInfo.pickInfo.pickedPoint.clone(); // 修正点
                        }
                        break;
                    case PointerEventTypes.POINTERMOVE:
                        if (isTouchActive && pointerInfo.pickInfo.pickedPoint) {
                            currentPointerPosition = pointerInfo.pickInfo.pickedPoint.clone();
                        }
                        break;
                    case PointerEventTypes.POINTERUP:
                        isTouchActive = false;
                        break;
                }
            });

            // End of Create Touch Function

            engine.runRenderLoop(() => {
                if (isTouchActive && lastPointerPosition && currentPointerPosition) {
                    let direction = currentPointerPosition.subtract(lastPointerPosition);
                    let amountValue = 0.5;
                    let rotationAmount = direction.x * amountValue; // スケールファクター調整
                    cylinder.rotate(Axis.Y, rotationAmount, Space.LOCAL);
                    lastPointerPosition = currentPointerPosition.clone(); // 次のフレームのために更新
                }
                scene.render();
            });

            return () => {
                engine.dispose();
            };
        }
    }, []);

    return (
        <>
            {/*<div
            className="dom-overlay-container"
            style={{ display: 'block' }}//通常モードのみARは使わない
        //onTouchStart={preventTouchPropagation}
        //onPointerDown={preventTouchPropagation}
        >
            <label>範囲 : {(sliderValue * 100).toFixed(2)}m</label>
            <input
                type="range"
                min="0.3"
                max="5"
                step="0.05"
                value={sliderValue}
                className="dom-overlay-slider"
                onChange={handleSliderChange}
            ></input>
        </div>*/}
            < canvas ref={canvasRef} style={{ width: '100vh', height: '100vh' }} />
        </>
    );
}


export default Compass;